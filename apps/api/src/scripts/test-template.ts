
import { Test } from '@nestjs/testing';
import { MailModule } from '../modules/mail/mail.module';
import { MailService } from '../modules/mail/mail.service';
import { ConfigModule } from '@nestjs/config';
import { getConfirmationEmailTemplate } from '../modules/mail/templates/confirmation.template';

async function bootstrap() {
    const moduleRef = await Test.createTestingModule({
        imports: [
            ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: 'apps/api/.env',
            }),
            MailModule,
        ],
    }).compile();

    const mailService = moduleRef.get<MailService>(MailService);
    const to = process.argv[2];

    if (!to) {
        console.error('Please provide an email address as an argument');
        process.exit(1);
    }

    console.log(`Sending confirmation test email to ${to}...`);

    const name = 'Nouvel Utilisateur';
    const verificationUrl = 'https://mkulimachain.com/auth/verify?token=example-token-123';
    const htmlContent = getConfirmationEmailTemplate(name, verificationUrl);

    const result = await mailService.send(
        to,
        'Confirmez votre compte Mkulima Chain',
        'Veuillez confirmer votre compte pour continuer.', // Fallback plain text
        htmlContent
    );

    if (result) {
        console.log('Confirmation email sent successfully!');
    } else {
        console.error('Failed to send confirmation email. Check logs for details.');
    }
}

bootstrap();
