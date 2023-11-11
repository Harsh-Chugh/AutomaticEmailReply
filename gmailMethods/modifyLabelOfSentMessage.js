/*
    @Description: Modifies the label of a sent message in a Gmail account.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
        message_id: string - Unique identifier for the message to be modified
        label_id: string - Unique identifier for the label to be added to the message
    @Return:
        Promise<void> - Resolves when the label modification is successful, rejects with an error message otherwise.
*/

async function modifyLabelOfSentMessage(gmail, message_id, label_id) {
    await gmail.users.messages.modify({
        userId: "me",
        id: message_id,
        resource: {
            "addLabelIds": [
                label_id
            ],
            "removeLabelIds": [
            ]
        }
    });
}

module.exports = { modifyLabelOfSentMessage };