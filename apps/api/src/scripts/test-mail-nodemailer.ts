import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from '../modules/mail/mail.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
    const logger = new Logger('TestMail');

    const module: TestingModule = await Test.createTestingModule({
        providers: [
            MailService,
            {
                provide: ConfigService,
                useValue: {
                    get: (key: string) => {
                        const config = {
                            SMTP_HOST: 'smtp.ethereal.email',
                            SMTP_PORT: 587,
                            SMTP_USER: 'test@ethereal.email',
                            SMTP_PASS: 'testpassword',
                            SMTP_FROM: 'noreply@mkulimachain.com',
                        };
                        return config[key];
                    },
                },
            },
        ],
    }).compile();

    const mailService = module.get<MailService>(MailService);

    logger.log('Attempting to send test email...');
    const result = await mailService.send(
        'test@example.com',
        'Test Email',
        'This is a test email from Nodemailer',
    );

    if (result) {
        logger.log('SUCCESS: Email sent (mock success)');
    } else {
        logger.error('FAILURE: Email failed to send (but code logic ran)');
    }
}

bootstrap();
