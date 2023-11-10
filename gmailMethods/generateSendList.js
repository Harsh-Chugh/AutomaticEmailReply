const { check } = require("../utils/checkDate");

async function generateSendList(gmail, messages, now) {
    let sendList = [];
    // Traversing on each unread message
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        // Fetch the thread's messages and count them
        try {
            const response = await gmail.users.threads.get({ userId: 'me', id: message.threadId });
            // Traverse  
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
            this_thread_messages.forEach((msg) => {
                if (check(this_thread_messages[this_thread_messages.length - 1].internalDate, now)) console.log(msg.labelIds);
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