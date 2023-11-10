const { google } = require('googleapis');
const readline = require('readline');
require("dotenv").config();
const fs = require('fs');
const express = require('express');
const { getClient } = require("./oAuthClient");
const { getUnreadMessages } = require("./gmailMethods/getUnreadMessages");
const { generateSendList } = require("./gmailMethods/generateSendList");
const { sendReply } = require("./gmailMethods/sendReply");

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  setOAuth2Client();
})

const now = new Date().getTime().toString();
const LABEL = "VACATION_RESPONSE";

let oauth2Client = null;
async function setOAuth2Client() {
  const oauthClient = await getClient();
  oauth2Client = oauthClient;
}

async function sendAutoMailReply() {
  if (oauth2Client) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const messages = await getUnreadMessages(gmail);

      if (messages.length > 0) {
        console.log(`You have ${messages.length} new unread emails.`);
        const sendList = await generateSendList(gmail, messages, now);
        sendReply(gmail, sendList);

      } else {
        console.log('No new unread emails found.');
      }
    }
    catch (err) {
      console.log(err);
    }
  }
}

setInterval(() => {
  sendAutoMailReply();
}, 12000);
