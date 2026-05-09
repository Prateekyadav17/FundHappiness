const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Create a transporter
    // For production, use service like SendGrid, Mailgun, or your own SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      }
    });

    // Define email options
    const mailOptions = {
      from: `FundHappiness <${process.env.EMAIL_FROM || 'no-reply@fundhappiness.com'}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${options.email}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw error; // Throw error so caller can handle failure
  }
};

module.exports = sendEmail;
