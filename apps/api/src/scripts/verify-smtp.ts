import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger le .env depuis la racine de api
const envPath = path.resolve(__dirname, '../..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error('Erreur: Impossible de charger le fichier .env :', result.error);
    process.exit(1);
}

console.log('Test de configuration SMTP...');
console.log(`Host: ${process.env.SMTP_HOST}`);
console.log(`User: ${process.env.SMTP_USER}`);
console.log(`From: ${process.env.SMTP_FROM}`);

async function verifySmtp() {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    try {
        // 1. Vérifier la connexion
        console.log('1. Vérification de la connexion au serveur SMTP...');
        await transporter.verify();
        console.log('✅ Connexion SMTP réussie !');

        // 2. Envoyer un email de test
        console.log('2. Envoi d\'un email de test à ' + process.env.SMTP_USER + '...');
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.SMTP_USER, // S'envoyer un mail à soi-même
            subject: 'Test Mkulima Chain SMTP',
            text: 'Si vous recevez ceci, votre configuration SMTP fonctionne !',
            html: '<h1>Succès !</h1><p>Si vous recevez ceci, votre configuration SMTP fonctionne parfaitement.</p>',
        });

        console.log('✅ Email envoyé avec succès !');
        console.log('Message ID:', info.messageId);
        console.log('--------------------------------------------------');
        console.log('Vous pouvez maintenant lancer l\'application avec :');
        console.log('pnpm run start:dev');
    } catch (error) {
        console.error('❌ Échec du test SMTP :');
        console.error(error);
    }
}

verifySmtp();
