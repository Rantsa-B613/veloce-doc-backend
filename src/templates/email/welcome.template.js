function welcomeTemplate({ prenom, email, password }) {
  const appUrl = process.env.FRONTEND_URL_PUBLIC || 'https://veloce-doc.vercel.app';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Bienvenue sur VeloceDoc</title>
</head>
<body style="margin:0;padding:0;background-color:#F0F5FF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Inter',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#F0F5FF;">
    <tr>
      <td align="center" style="padding:48px 20px;">

        <!-- Carte principale -->
        <table width="580" cellpadding="0" cellspacing="0" border="0"
          style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,.04),0 24px 48px rgba(37,99,235,.12);max-width:580px;">

          <!-- ── Header gradient ── -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);padding:40px 40px 36px;text-align:center;">

              <!-- Logo box -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 18px;">
                <tr>
                  <td style="background:rgba(255,255,255,.15);border-radius:14px;width:56px;height:56px;text-align:center;vertical-align:middle;">
                    <img src="https://em-content.zobj.net/source/google/387/page-facing-up_1f4c4.png"
                      width="30" height="30" alt="📄"
                      style="display:block;margin:13px auto;">
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 6px;color:#ffffff;font-size:26px;font-weight:800;letter-spacing:-.02em;">VeloceDoc</h1>
              <p style="margin:0;color:rgba(255,255,255,.75);font-size:13px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;">Génération de documents intelligente</p>
            </td>
          </tr>

          <!-- ── Corps ── -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Titre -->
              <h2 style="margin:0 0 10px;color:#060B18;font-size:22px;font-weight:700;letter-spacing:-.01em;">
                Bienvenue, ${prenom}&nbsp;
              </h2>
              <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.65;">
                Votre compte VeloceDoc a été créé avec succès. Voici vos informations de connexion&nbsp;:
              </p>

              <!-- Bloc identifiants -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#F0F5FF;border-radius:14px;border:1px solid rgba(37,99,235,.15);margin-bottom:20px;">
                <tr>
                  <td style="padding:24px 28px;">

                    <!-- Email -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding-bottom:16px;">
                          <p style="margin:0 0 4px;color:#94A3B8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Identifiant</p>
                          <p style="margin:0;color:#060B18;font-size:15px;font-weight:500;">${email}</p>
                        </td>
                      </tr>
                      <!-- Séparateur -->
                      <tr>
                        <td style="border-top:1px solid #E2E8F0;padding-top:16px;">
                          <p style="margin:0 0 4px;color:#94A3B8;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;">Mot de passe</p>
                          <p style="margin:0;color:#2563EB;font-size:16px;font-weight:700;font-family:'Courier New',Courier,monospace;letter-spacing:.05em;">${password}</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Alerte sécurité -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#fef3c7;border-radius:10px;border:1px solid #fcd34d;margin-bottom:32px;">
                <tr>
                  <td style="padding:14px 18px;">
                    <p style="margin:0;color:#92400e;font-size:13px;line-height:1.5;">
                      <strong>Informations confidentielles</strong> — Ne partagez pas ces identifiants. Gardez-les en lieu sûr et ne les communiquez à personne.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Bouton CTA -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563EB 0%,#7C3AED 100%);border-radius:12px;box-shadow:0 4px 14px rgba(37,99,235,.35);">
                    <a href="${appUrl}"
                      style="display:block;padding:15px 36px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:-.01em;white-space:nowrap;">
                      Accéder à VeloceDoc &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Séparateur ── -->
          <tr>
            <td style="padding:0 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="border-top:1px solid #E2E8F0;"></td></tr>
              </table>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 6px;color:#64748B;font-size:13px;font-weight:600;">VeloceDoc</p>
              <p style="margin:0;color:#94A3B8;font-size:12px;line-height:1.6;">
                Vous recevez cet email car un compte a été créé avec votre adresse.<br>
                Si vous n'êtes pas à l'origine de cette inscription, ignorez cet email.
              </p>
            </td>
          </tr>

        </table>

        <!-- Copyright -->
        <p style="margin:28px 0 0;color:#94A3B8;font-size:12px;text-align:center;">
          &copy; ${new Date().getFullYear()} VeloceDoc &mdash; Tous droits réservés
        </p>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

module.exports = { welcomeTemplate };
