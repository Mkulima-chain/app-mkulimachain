
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserEntity } from '../auth/entities/user.entity';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            host: this.configService.get<string>('SMTP_HOST'),
            port: this.configService.get<number>('SMTP_PORT'),
            secure: this.configService.get<boolean>('SMTP_SECURE', false), // true for 465, false for other ports
            auth: {
                user: this.configService.get<string>('SMTP_USER'),
                pass: this.configService.get<string>('SMTP_PASS'),
            },
        });
    }

    async send(to: string, subject: string, content: string, html?: string): Promise<boolean> {
        const from = this.configService.get<string>('SMTP_FROM');

        if (!from) {
            this.logger.error('SMTP_FROM not set');
            return false;
        }

        const mailOptions = {
            from,
            to,
            subject,
            text: content,
            html: html || content,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`Email sent to ${to}`);
            return true;
        } catch (error) {
            this.logger.error('Error sending email', error);
            return false;
        }
    }

    async sendWelcomeEmail(user: UserEntity): Promise<boolean> {
        const subject = 'Bienvenue sur Mkulima Chain';
        const content = `Bonjour ${user.firstName},

Bienvenue sur Mkulima Chain ! Nous sommes ravis de vous compter parmi nous.

Votre compte a été créé avec succès.

Cordialement,
L'équipe Mkulima Chain`;

        const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue sur Mkulima Chain</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-top: 40px; margin-bottom: 40px; }
        .header { background-color: #2E7D32; padding: 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 40px 30px; color: #333333; line-height: 1.6; }
        .h2 { color: #1B5E20; font-size: 22px; margin-top: 0; margin-bottom: 20px; }
        .button { display: inline-block; background-color: #43A047; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 4px; font-weight: bold; margin-top: 20px; text-align: center; }
        .button:hover { background-color: #2E7D32; }
        .footer { background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #888888; border-top: 1px solid #eeeeee; }
        .footer a { color: #2E7D32; text-decoration: none; }
        @media only screen and (max-width: 600px) {
            .container { width: 100% !important; border-radius: 0; margin-top: 0; margin-bottom: 0; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Mkulima Chain</h1>
        </div>
        <div class="content">
            <h2 class="h2">Bienvenue, ${user.firstName} !</h2>
            <p>Nous sommes ravis de vous accueillir dans la communauté <strong>Mkulima Chain</strong>.</p>
            <p>Votre compte a été créé avec succès. Vous pouvez désormais accéder à notre plateforme pour suivre vos productions, gérer votre portefeuille et participer à l'écosystème.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://app.mkulimachain.com/dashboard" class="button">Accéder à mon tableau de bord</a>
            </div>
            <p>Si vous avez des questions, n'hésitez pas à répondre à cet email ou à contacter notre support.</p>
            <p>Cordialement,<br>L'équipe Mkulima Chain</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Mkulima Chain. Tous droits réservés.</p>
            <p>
                <a href="#">Conditions d'utilisation</a> | <a href="#">Politique de confidentialité</a>
            </p>
        </div>
    </div>
</body>
</html>
        `;

        return this.send(user.email, subject, content, html);
    }
}
