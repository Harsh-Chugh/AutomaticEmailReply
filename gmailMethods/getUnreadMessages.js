const { compressArray } = require("../utils/compressArray");


/*
    @Description: Retrieves a list of unread messages from a Gmail account.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
    @Return:
        Promise<Array<Object>> - Resolves with an array of unique message objects representing unread messages. Each message object has the following format:
        [
            {
                id: string,       // Unique identifier for the message
                threadId: string  // Unique identifier for the thread to which the message belongs
            },
            // ... (additional message objects)
        ]
*/

async function getUnreadMessages(gmail) {
    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread', // Search for unread emails
    });
    const messages = response.data.messages;
    return compressArray(messages);
}

module.exports = { getUnreadMessages };