const readline = require('readline');
const fs = require('fs');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly", "https://www.googleapis.com/auth/gmail.send", "https://www.googleapis.com/auth/gmail.modify"];

const TOKEN_PATH = "token.json";

// This is for fresh authentication
async function authenticate() {
    return new Promise((resolve, reject) => {
        const authURL = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: SCOPES,
            prompt: 'consent'
        });

        console.log("Go to this url and grant access. Then get the code and enter it.\n", authURL);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        rl.question('Enter the code from the URL: ', (code) => {
            rl.close();
            oauth2Client.getToken(code, (err, token) => {
                if (err) {
                    reject("Error retrieving access token");
                    // return console.error('Error retrieving access token:', err);
                }
                // Save the token to a file.
                fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                resolve("Authenticated");
            });
        });
    })
}

async function setToken() {
    const token = fs.readFileSync("token.json");
    oauth2Client.setCredentials(JSON.parse(token));
}

async function getClient() {
    try {
        console.log("Setting token");
        await setToken();
        return oauth2Client;
    }
    catch (err) {
        // This will be the case when token expires. We need to reauthenticate.
        let loopCheck = true;
        while (loopCheck) {
            try {
                const resp = await authenticate();
                console.log(resp);
                loopCheck = false;
            }
            catch (error) {
                console.log(error);
            }
        }
        await setToken();
        return oauth2Client;
    }
}

module.exports = { getClient };