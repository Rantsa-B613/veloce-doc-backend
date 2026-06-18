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

async function sendContactEmail({ name, email, message }) {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
        <h2 style="margin:0 0 4px;font-size:18px;color:#0f172a">Nouveau message — VeloceDoc</h2>
        <p style="margin:0 0 24px;font-size:13px;color:#94a3b8">Via le formulaire de contact</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:10px 14px;background:#f1f5f9;border-radius:6px 0 0 6px;font-size:12px;font-weight:700;color:#64748b;white-space:nowrap">Nom</td>
            <td style="padding:10px 14px;background:#f8fafc;border-radius:0 6px 6px 0;font-size:14px;color:#0f172a">${name}</td>
          </tr>
          <tr><td colspan="2" style="padding:3px"></td></tr>
          <tr>
            <td style="padding:10px 14px;background:#f1f5f9;border-radius:6px 0 0 6px;font-size:12px;font-weight:700;color:#64748b;white-space:nowrap">E-mail</td>
            <td style="padding:10px 14px;background:#f8fafc;border-radius:0 6px 6px 0;font-size:14px;color:#2563eb"><a href="mailto:${email}" style="color:#2563eb">${email}</a></td>
          </tr>
        </table>
        <div style="background:#f1f5f9;border-radius:8px;padding:16px 18px">
          <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.05em">Message</p>
          <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.7;white-space:pre-wrap">${message}</p>
        </div>
        <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px">Répondre directement à cet e-mail pour contacter ${name}.</p>
      </div>
    </div>`;

  await transporter.sendMail({
    from:    `"VeloceDoc Contact" <${process.env.EMAIL_USER}>`,
    to:      ['rantsajonathan@gmail.com', 'jonathan@alfa-partenaires.com'],
    replyTo: email,
    subject: `[Contact] Message de ${name}`,
    html,
  });
}

async function sendSubscriptionRequest({ whatsapp, planName }) {
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#f8fafc">
      <div style="background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
        <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);border-radius:8px;padding:16px 20px;margin-bottom:24px">
          <p style="margin:0;font-size:11px;font-weight:700;color:rgba(255,255,255,.7);text-transform:uppercase;letter-spacing:.06em">VeloceDoc — Demande d'abonnement</p>
          <h2 style="margin:6px 0 0;font-size:20px;font-weight:800;color:#fff">Nouveau prospect</h2>
        </div>
        <p style="font-size:15px;color:#334155;line-height:1.6;margin:0 0 20px">
          Un client souhaite souscrire au plan <strong style="color:#2563EB">${planName}</strong> et attend votre contact.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr>
            <td style="padding:12px 14px;background:#f1f5f9;border-radius:6px 0 0 6px;font-size:12px;font-weight:700;color:#64748b;white-space:nowrap">Plan souhaité</td>
            <td style="padding:12px 14px;background:#eff6ff;border-radius:0 6px 6px 0;font-size:15px;font-weight:700;color:#2563EB">${planName}</td>
          </tr>
          <tr><td colspan="2" style="padding:4px"></td></tr>
          <tr>
            <td style="padding:12px 14px;background:#f1f5f9;border-radius:6px 0 0 6px;font-size:12px;font-weight:700;color:#64748b;white-space:nowrap">WhatsApp</td>
            <td style="padding:12px 14px;background:#f0fdf4;border-radius:0 6px 6px 0;font-size:15px;font-weight:700;color:#16a34a">${whatsapp}</td>
          </tr>
        </table>
        <a href="https://wa.me/${whatsapp.replace(/\D/g,'')}" style="display:inline-block;background:#25D366;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 24px;border-radius:8px">
          Contacter sur WhatsApp
        </a>
        <p style="margin:20px 0 0;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:16px">
          Ce client a fourni son numéro via la page tarifaire de VeloceDoc.
        </p>
      </div>
    </div>`;

  await transporter.sendMail({
    from:    `"VeloceDoc" <${process.env.EMAIL_USER}>`,
    to:      ['rantsajonathan@gmail.com', 'jonathan@alfa-partenaires.com'],
    subject: `[Abonnement] Demande plan ${planName} — ${whatsapp}`,
    html,
  });
}

module.exports = { sendWelcomeEmail, sendContactEmail, sendSubscriptionRequest };
