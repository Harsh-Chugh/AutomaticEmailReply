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