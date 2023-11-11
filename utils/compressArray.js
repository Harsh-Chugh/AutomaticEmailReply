/*
    @Description: Compresses an array of messages by removing duplicates based on the threadId property.
    @Params:
        messages: Array - An array of message objects with properties {id, threadId}
    @Return:
        Array - Returns a new array containing unique messages based on their threadId.
*/
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

module.exports = { compressArray };