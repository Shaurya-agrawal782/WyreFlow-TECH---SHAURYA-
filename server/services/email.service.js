const transporter = require('../config/mail.config');

/**
 * Sends an email asynchronously (fire-and-forget)
 * @param {Object} options
 * @param {String} options.to Receiver email address
 * @param {String} options.subject Email subject line
 * @param {String} options.html HTML email body content
 * @returns {Promise<Object>} Response metadata
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    const fromAddress = process.env.SMTP_FROM_EMAIL || '"Recruitment Platform" <no-reply@recruitment.com>';
    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email sent successfully. MessageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email Service] Error sending email:', error.message || error);
    // Suppress error to avoid crashing application request/response lifecycle
  }
};

module.exports = {
  sendEmail
};
