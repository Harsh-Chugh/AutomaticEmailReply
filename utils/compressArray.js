export default function compressArray(messages) {
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