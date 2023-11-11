/*
    @Description: gets the label id of the label
    @Params:
        labels: [{labelName: "xyz", labelId: "123"}, {...} , ...]
        label : string - Representing the labelName
    @Return:
        string - labelId
*/
async function get_label_id(labels, label) {
    let label_id = '';
    for (let i = 0; i < labels.length; i++) {
        if (labels[i].labelName === label) {
            label_id = labels[i].labelId;
            break;
        }
    }
    return label_id;
}

/*
    @Description: Retrieves a list of labels associated with a Gmail account.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
    @Return:
        Array - An array of label objects with properties {labelId, labelName}
*/
async function getLabels(gmail) {
    const response = await gmail.users.labels.list({ userId: "me" });
    return response.data.labels.map(label => ({
        labelId: label.id,
        labelName: label.name
    }));
}

/*
    @Description: Creates a new label in a Gmail account.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
        labelName: string - The name of the label to be created
    @Return:
        boolean - Returns true if the label creation is successful, otherwise false.
*/

async function createLabel(gmail, labelName) {
    try {
        const label = await gmail.users.labels.create({
            userId: 'me',
            resource: {
                labelListVisibility: 'labelShow',
                messageListVisibility: 'show',
                name: labelName
            }
        });
        console.log("label created", label);
        return true;
    } catch (error) {
        console.error("Error creating label:", error.message);
        return false;
    }

}

/*
    @Description: Checks if a given label is present in a list of labels.
    @Params:
        labels: Array - An array of label objects with properties {labelName, labelId}
        label: string - The labelName to check for in the list
    @Return:
        boolean - Returns true if the label is found in the list, otherwise false.
*/

function includesLabel(labels, label) {
    return labels.some(l => l.labelName === label);
}

/*
    @Description: Checks if a label exists; creates it if not, and returns the labelId.
    @Params:
        gmail: Object - Gmail API client instance (e.g., created using google.gmail({ version: 'v1', auth: oauth2Client }))
        label: string - The labelName to check for or create
    @Return:
        Promise<string> - Resolves with the labelId if successful, rejects with an error message otherwise.
*/

async function checkAndCreateLabels(gmail, label) {
    return new Promise(async (resolve, reject) => {
        // Get labels
        let labels = await getLabels(gmail);

        // Check if it exists
        if (!includesLabel(labels, label)) {
            // Create that label
            console.log("label is included");
            const resp = await createLabel(gmail, label);
            if (!resp) reject(`Could not create the label - ${label}`);
            // Update labels array after creating new label
            labels = await getLabels(gmail);
        }

        // Get the Label id
        const label_id = await get_label_id(labels, label);
        console.log("label id: ", label_id);
        resolve(label_id);
    })
}

module.exports = { checkAndCreateLabels };