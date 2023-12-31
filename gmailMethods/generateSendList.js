const { check } = require("../utils/checkDate");

/*
    @Description: Generates a list of messages eligible for autoreply based on specified criteria.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
        messages: Array - An array of message objects with properties {id, threadId}
        now: Date - The date and time when the server started (used for time-based filtering)
    @Return:
        Promise<Array<Object>> - Resolves with an array of message objects eligible for autoreply. Each message object in the array has the following format:
        [
            {
                id: string,       // Unique identifier for the message
                threadId: string, // Unique identifier for the thread to which the message belongs
                From: string,     // Sender information
                Subject: string,  // Subject of the message
                To: string        // Recipient information
            },
            // ... (additional message objects)
        ]
*/
async function generateSendList(gmail, messages, now) {
    let sendList = [];
    // Traversing on each unread message
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        // Fetch the thread's messages and count them
        try {
            const response = await gmail.users.threads.get({ userId: 'me', id: message.threadId });
            // this_thread_messages contains all messages of {message} 's thread id
            const this_thread_messages = response.data.messages;

            if (!check(this_thread_messages[this_thread_messages.length - 1].internalDate, now)) {
                break;
            }

            const filterProperty = ["From", "Subject", "To"];
            let metadata = {
                From: "",
                Subject: "",
                To: ""
            }

            let latest_message_headers = this_thread_messages[this_thread_messages.length - 1].payload.headers;
            for (let i = 0; i < latest_message_headers.length; i++) {
                if (filterProperty.includes(latest_message_headers[i].name)) {
                    metadata[latest_message_headers[i].name] = latest_message_headers[i].value;
                }
            }

            let send_autoreply = true;
            // check if thread already contains a 'SENT' message
            this_thread_messages.forEach((msg) => {
                if (msg.labelIds.includes('SENT')) {
                    send_autoreply = false;
                }
            });

            if (send_autoreply) {
                sendList.push({ ...message, ...metadata });
            }
        }
        catch (error) {
            console.error('Error fetching thread:', error);
        }
    };
    console.log("Done filtering")
    console.log("sendList: ", sendList);
    return sendList;
}

module.exports = { generateSendList };