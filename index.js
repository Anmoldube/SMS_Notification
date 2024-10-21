const express = require("express");
const mongoose = require("mongoose");
const app = express();
const twilio = require('twilio');

// Twilio credentials
const accountSid = ''; // Replace with your actual Account SID
const authToken = ''; // Replace with your actual Auth Token
const client = twilio(accountSid, authToken);

// MongoDB connection string
const mongoURI = '';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });

// Define the SoftwareData model
const SoftwareDataSchema = new mongoose.Schema({
    name: String,
    EXP: Date // Expiration date
});

const SoftwareData = mongoose.model('SoftwareData', SoftwareDataSchema);

// Function to check for expiring software
const checkExpiryDates = async() => {
    try {
        const now = new Date();
        const tenDaysFromNow = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

        console.log(`Checking for software expiring between ${now} and ${tenDaysFromNow}`);

        const expiringSoon = await SoftwareData.find({
            EXP: { $lte: tenDaysFromNow, $gte: now },
        });

        if (expiringSoon.length > 0) {
            console.log("Found expiring software:", expiringSoon);
            sendSMS(expiringSoon);
        }
    } catch (error) {
        console.error("Error checking expiry dates:", error);
    }
};

// Function to send SMS
const sendSMS = (expiringSoon) => {
    const softwareNames = expiringSoon.map(software => software.name).join(', ');
    const messageBody = `Hi Anmol Dube, the following software is expiring soon: ${softwareNames}. Please update the data accordingly.`;

    client.messages
        .create({
            body: messageBody,
            messagingServiceSid: 'MGcab09adfcb82f54dbe9360496ff5d290', // Your Messaging Service SID
            to: '+917906801798' // Recipient phone number
        })
        .then(message => console.log(`Message sent! SID: ${message.sid}`))
        .catch(error => console.error('Error sending message:', error));
};

// Run the check every 10 seconds
setInterval(checkExpiryDates, 5000); // 10000 milliseconds = 10 seconds

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
