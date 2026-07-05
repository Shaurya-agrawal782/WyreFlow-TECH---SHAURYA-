const nodemailer = require('nodemailer');

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

let transporter;

if (host && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
} else {
  // Fallback / Development: dry-run / logger transporter
  console.log('SMTP config not fully provided. Falling back to a dummy dry-run mail transporter.');
  transporter = {
    sendMail: async (mailOptions) => {
      console.log('--- DRY RUN EMAIL SENT ---');
      console.log(`To: ${mailOptions.to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`Body Snippet: ${mailOptions.html ? mailOptions.html.substring(0, 200).replace(/\s+/g, ' ') + '...' : ''}`);
      console.log('--------------------------');
      return { messageId: 'dry-run-msg-id-' + Date.now() };
    }
  };
}

module.exports = transporter;
