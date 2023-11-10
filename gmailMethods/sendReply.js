const { checkAndCreateLabels } = require("./checkAndCreateLabels");
const { modifyLabelOfSentMessage } = require("./modifyLabelOfSentMessage");

const LABEL = "VACATION_RESPONSE";

async function sendReply(gmail, sendList) {
    for (let i = 0; i < sendList.length; i++) {
        // prepare message
        let rawMessage = `To: ${sendList[i].From}\r\n`;
        rawMessage += `From: ${sendList[i].To}\r\n`;
        rawMessage += `Subject: Re: ${sendList[i].Subject}\r\n\r\n`;
        rawMessage += 'Autogenerated: I am on vacation. I will get back to you in some days.';

        // Encode message
        const encodedMessage = Buffer.from(rawMessage).toString('base64');

        const sendMessage = {
            raw: encodedMessage,
            'threadId': sendList[i].threadId,
            'In-Reply-To': sendList[i].threadId,
            'References': sendList[i].threadId
        };

        try {
            // send message
            const resp = await gmail.users.messages.send({
                userId: 'me',
                resource: sendMessage
            });
            console.log("Sent Successfully iteration: " + i);

            // modify label of 'SENT' message
            const labelId = await checkAndCreateLabels(gmail, LABEL);
            await modifyLabelOfSentMessage(gmail, resp.data.id, labelId);
        }
        catch (err) {
            console.log(err);
        }
    }
}

module.exports = { sendReply };