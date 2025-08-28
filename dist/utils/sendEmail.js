"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// mailer.js
const mailjet = require('node-mailjet');
const mailjetClient = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
// Load and compile Handlebars template
// Send email
const sendMailjetEmail = async (req, res, options) => {
    const { subject, to, emailTemplate, mailData } = options;
    req.app.render(emailTemplate, mailData, async (err, html) => {
        if (err || !html) {
            console.error('Template render error:', err);
            throw new Error("Failed to render email template");
        }
        try {
            const request = await mailjetClient.post('send', { version: 'v3.1' }).request({
                Messages: [
                    {
                        From: {
                            Email: 'ukonulucky@gmail.com',
                            Name: 'SmartTek Bank',
                        },
                        To: [
                            {
                                Email: to[0].email,
                                Name: to[0].name,
                            },
                        ],
                        Subject: subject,
                        HTMLPart: html,
                    },
                ],
            });
            console.log('Email sent successfully from mailjet:', request.body);
        }
        catch (err) {
            console.error('Email sending failed:', err);
        }
    });
};
exports.default = sendMailjetEmail;
