
import { Test } from '@nestjs/testing';
import { MailModule } from '../modules/mail/mail.module';
import { MailService } from '../modules/mail/mail.service';
import { ConfigModule } from '@nestjs/config';

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

    console.log(`Sending test email to ${to}...`);
    const result = await mailService.send(
        to,
        'Test Email',
        'This is a test email from the Mkulima Chain API (Isolated Test).',
    );

    if (result) {
        console.log('Email sent successfully!');
    } else {
        console.error('Failed to send email. Check logs for details.');
    }
}

bootstrap();
