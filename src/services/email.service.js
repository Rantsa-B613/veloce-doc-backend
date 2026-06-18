const nodemailer = require('nodemailer');
const { welcomeTemplate } = require('../templates/email/welcome.template');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function baseOptions(to, subject) {
  return {
    from:    `"${process.env.EMAIL_FROM || 'VeloceDoc'}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    bcc:     process.env.EMAIL_BCC,
    replyTo: process.env.EMAIL_REPLY_TO,
  };
}

async function sendWelcomeEmail({ email, prenom, password }) {
  const html = welcomeTemplate({ prenom, email, password });

  await transporter.sendMail({
    ...baseOptions(email, 'Bienvenue sur VeloceDoc — vos identifiants'),
    html,
  });
}

module.exports = { sendWelcomeEmail };
