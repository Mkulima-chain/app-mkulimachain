
export const getConfirmationEmailTemplate = (name: string, url: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmez votre compte</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
            color: #333333;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background-color: #2c3e50;
            color: #ffffff;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 30px;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #27ae60;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 20px;
            text-align: center;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #7f8c8d;
            border-top: 1px solid #eeeeee;
        }
        .link-text {
            color: #2980b9;
            word-break: break-all;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Bienvenue chez Mkulima Chain</h1>
        </div>
        <div class="content">
            <p>Bonjour <strong>${name}</strong>,</p>
            <p>Nous sommes ravis de vous compter parmi nous ! Pour commencer à explorer toutes les fonctionnalités de Mkulima Chain, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous :</p>
            
            <div style="text-align: center;">
                <a href="${url}" class="button">Confirmer mon compte</a>
            </div>

            <p style="margin-top: 30px;">Si le bouton ne fonctionne pas, vous pouvez copier et coller le lien suivant dans votre navigateur :</p>
            <p><a href="${url}" class="link-text">${url}</a></p>
            
            <p>Ce lien expirera dans 24 heures.</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Mkulima Chain. Tous droits réservés.</p>
            <p>Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.</p>
        </div>
    </div>
</body>
</html>
`;
