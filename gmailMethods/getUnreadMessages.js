const { compressArray } = require("../utils/compressArray");

async function getUnreadMessages(gmail) {
    const response = await gmail.users.messages.list({
        userId: 'me',
        q: 'is:unread', // Search for unread emails
    });
    const messageIds = response.data.messages;
    return compressArray(messageIds);
}

module.exports = { getUnreadMessages };