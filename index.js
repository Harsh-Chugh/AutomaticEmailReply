const { default: axios } = require("axios");
const {google} = require('googleapis');
const readline = require('readline');
require("dotenv").config();
const fs = require('fs');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
  console.log(`Server is running on port ${PORT}`);
})

const now = new Date().getTime().toString();
// const now = '1699532379255';

console.log(typeof(now));
const LABEL = "VACATION_RESPONSE";

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
  );


  // Created in utils but check once
function check(internalDate){
    let size_now = now.length;
    let size_internalDate = internalDate.length;

    console.log(internalDate)

    if(size_internalDate > size_now)  return true;

    // size_internalDate < size_now not possible
    for(i = 0; i < size_now; i++)
    {
        if(now[i] == internalDate[i]) continue;
        return internalDate[i] > now[i];
    }

}

// Created in utils
function compressArray(messages) {
  const uniqueThreads = new Set();
  const compressedMessages = [];

  for (const message of messages) {
    if (!uniqueThreads.has(message.threadId)) {
      uniqueThreads.add(message.threadId);
      compressedMessages.push(message);
    }
  }

  return compressedMessages;
}

async function get_token(){
      const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.modify"];

      const authURL = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
      });

      console.log("Go to this url and grant access. Then get the code and enter it - ",  authURL);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('Enter the code from the URL: ', (code) => {
        rl.close();
        oauth2Client.getToken(code, (err, token) => {
          if (err) {
            return console.error('Error retrieving access token:', err);
          }
          // Save the token to a file.
          fs.writeFileSync("token.json", JSON.stringify(token));
        });
      });
}


async function test(){
    try{
        const token = fs.readFileSync("token.json");

        oauth2Client.setCredentials(JSON.parse(token));
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread', // Search for unread emails
        });
        const messageIds = response.data.messages;

        const messageId = response.data.messages[1].id;
        gmail.users.messages.get({ userId: 'me', id: messageId }, (err, response) => {
            if (err) {
              console.error('The API returned an error:', err);
              return;
            }
          });

        // Read new unread messages
        const resp = await gmail.users.messages.list({
            userId: 'me',
             q: 'is:unread', // Search for unread emails
          });
      
        let messages = compressArray(resp.data.messages);


        if (messages.length > 0) {
            console.log(`You have ${messages.length} new unread emails.`);
            console.log(messages);
          } else {
            console.log('No new unread emails found.');
        }

        // console.log(messages);


        console.log("Started filtering")
        // Get Send List - (which messages should be replied)
        let sendList = [];
        // Traversing on each unread message
        for(let i = 0; i < messages.length; i++){
          console.log(i);
            const message = messages[i];
             // Fetch the thread's messages and count them
             try{
                const response = await gmail.users.threads.get({userId: 'me',id: message.threadId });
                // Traverse  
                // this_thread_messages contains all messages of {message} 's thread id
                const this_thread_messages = response.data.messages;
                // console.log(this_thread_messages);

                if(check(this_thread_messages[this_thread_messages.length - 1].internalDate))  console.log(this_thread_messages);
                // console.log("Message in the thread: " + message.threadId);
                //  console.log(typeof(this_thread_messages[this_thread_messages.length - 1].internalDate));
                // console.log(typeof(now));

                if(!check(this_thread_messages[this_thread_messages.length - 1].internalDate)){
                    break;
                }
                // console.log("header" ,this_thread_messages[this_thread_messages.length - 1].payload.headers);
                // console.log("body" ,this_thread_messages[this_thread_messages.length - 1].payload.body);
                // console.log("parts" ,this_thread_messages[this_thread_messages.length - 1].payload.parts);
                
                const filterProperty = ["From", "Subject", "To"];
                let metadata = {
                  From: "",
                  Subject: "",
                  To: ""
                }

                let latest_message_headers = this_thread_messages[this_thread_messages.length - 1].payload.headers;
                for(let i = 0; i < latest_message_headers.length; i++){
                    if(filterProperty.includes(latest_message_headers[i].name)){
                      metadata[latest_message_headers[i].name] = latest_message_headers[i].value;
                    }
                }


                // let send_autoreply = check(this_thread_messages[this_thread_messages.length - 1].internalDate);
                let send_autoreply = true;
                this_thread_messages.forEach((msg) => {
                    if(check(this_thread_messages[this_thread_messages.length - 1].internalDate))console.log(msg.labelIds);
                    if(msg.labelIds.includes('SENT')){
                        send_autoreply = false;
                    }
                });

                if(send_autoreply) {
                    sendList.push({...message, ...metadata});
                }
             }
             catch(error){
               console.error('Error fetching thread:', error);
             }
        };
        console.log("Done filtering")
        console.log("sendList: ", sendList);

        // Just for testing label functionalities
        const labels = await getLabels(gmail);
        console.log("Labels : ", labels);


        // const respo = await gmail.users.messages.modify({userId: "me", 
        // id: '18bb43e33cec4846',
        // resource: {
        //   "addLabelIds": [
        //     'Label_1'
        //   ],
        //   "removeLabelIds": [
        //   ]
        // }});
        // console.log("label modified: ", respo);

        // await createLabel(gmail);


        // Send Reply
        for(let i = 0; i < sendList.length; i++){
          let rawMessage = `To: ${sendList[i].From}\r\n`;
          rawMessage += `From: ${sendList[i].To}\r\n`;
          rawMessage += `Subject: Re: ${sendList[i].Subject}\r\n\r\n`;
          rawMessage += 'Autogenerated: I am on vacation. I will get back to you in some days.';
          // Encode message
          const encodedMessage = Buffer.from(rawMessage).toString('base64');

          const sendMessage = {
            raw: encodedMessage,
            'threadId': sendList[i].threadId,
            'In-Reply-To' : sendList[i].threadId,
            'References' : sendList[i].threadId
          };
          console.log("sendMessage", sendMessage);

          try{
            const resp = await gmail.users.messages.send({
              userId: 'me',
              resource: sendMessage
              
            });
            console.log("Response after sending email ", resp)
            console.log("Sent Successfully iteration: " + i);


            // Get labels
            // const response = await gmail.users.labels.list({userId : "me"});
            const labels = await getLabels(gmail);
            console.log("Labels : ", labels);

            if(!labels.includes(LABEL)){
              // Create that label
              // await createLabel(gmail);
            }

            // Get the VACATION_RESPONSE Label email id
            const label_id = await get_label_id(labels);
            console.log("label id: ", label_id);
            // Add the label to the email sent above

            const respo = await gmail.users.messages.modify({userId: "me", 
              id: resp.data.id,
              resource: {
                "addLabelIds": [
                  label_id
                ],
                "removeLabelIds": [
                ]
              }});
              
              console.log("label modified: ", respo);

          
            
          }
          catch(err){
            console.log(err);
          }
        }

}
    catch(err){
        console.log(err)
    }
} 

async function get_label_id(labels){
    let label_id = '';
    for(let i = 0; i < labels.length; i++){
      if(labels[i].labelName === LABEL){
        label_id = labels[i].labelId;
        break;
      }
    }
    return label_id;
}



async function getLabels(gmail) {
  const response = await gmail.users.labels.list({ userId: "me" });
  return response.data.labels.map(label => ({
    labelId: label.id,
    labelName: label.name
  }));
}

async function createLabel(gmail){
//   const respo = await gmail.users.labels.create({ 
//   userId : 'me',
//   resource: {

//     labelListVisibility   : 'labelShow',
//     messageListVisibility : 'show',
//     name : LABEL
// }});
//   console.log("respo" , respo);

  const label_body = {
    "name": "VACATION_RESPONSE",
    "labelListVisibility": "labelShow",
    "messageListVisibility": "show"
  };




  // const label = await gmail.users.labels.create({userId: 'me', resource:label_body});
  try {
    const label = await gmail.users.labels.create({
      userId : 'me',
      resource: {
        labelListVisibility   : 'labelShow',
        messageListVisibility : 'show',
        name : 'TEST_LABEL'
      }
    });
    // 18bb426041734cd3
    //Get the label ID
    // label_id = label.data.id;
    console.log("label created", label);
  } catch (error) {
    console.error("Error creating label:", error.message);
  }
  
}

  
  
  
// while(true){
//     test();
//     console.log("-----------------------------------------------------------------------------------");

//     delay
// }


setInterval(() =>{
  // console.log("Testing timeout")
  test();
} , 12000);
// test();
// listThreads();
// get_token();
// while(true){
//     setTimeout(() => {
//         console.log("Delayed code executed after 2 seconds");
//     }, 2000);
// }
