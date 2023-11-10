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

async function getLabels(gmail) {
    const response = await gmail.users.labels.list({ userId: "me" });
    return response.data.labels.map(label => ({
        labelId: label.id,
        labelName: label.name
    }));
}

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

function includesLabel(labels, label) {
    return labels.some(l => l.labelName === label);
}

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