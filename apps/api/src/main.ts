import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const constraints = Object.values(error.constraints || {});
          return `${error.property}: ${constraints.join(', ')}`;
        });
        return new Error(messages.join('; '));
      },
    }),
  );

  // Enable CORS for frontend and admin
  const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:5601', 'http://localhost:5602'];

  // Ajouter les origines depuis les variables d'environnement si définies
  const adminUrl = process.env.ADMIN_URL;
  const webUrl = process.env.WEB_URL;
  
  if (adminUrl && !allowedOrigins.includes(adminUrl)) {
    allowedOrigins.push(adminUrl);
  }
  if (webUrl && !allowedOrigins.includes(webUrl)) {
    allowedOrigins.push(webUrl);
  }

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Autoriser localhost et les adresses IP locales (192.168.x.x, 172.x.x.x, 10.x.x.x)
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      const isLocalIP = /^https?:\/\/(192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|10\.)/.test(origin);
      
      if (allowedOrigins.includes(origin) || isLocalhost || isLocalIP) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('MkulimaChain API')
    .setDescription(
      `
## MkulimaChain - Agricultural Supply Chain on Cardano

API pour la plateforme de traçabilité agricole et DeFi pour les agriculteurs congolais.

### Fonctionnalités principales:

- ** Farmers** - Gestion des agriculteurs et coopératives
- ** Harvest** - Suivi des récoltes avec proof-of-harvest
- ** Batch** - Lots de production et traçabilité
- ** Supply Chain** - Étapes de la chaîne d'approvisionnement
  - ** Wallet** - Portefeuilles ADA et Mobile Money
- ** Finance** - Micro-prêts DeFi et scores de crédit
- ** Mobile Money** - Intégration Airtel, Orange, M-Pesa
- ** Marketplace** - Place de marché pour produits agricoles
- ** NFT** - NFTs culturels pour financer les écoles
- ** School Fund** - Fonds pour les écoles congolaises

### Blockchain:
- Cardano (ADA)
- Smart Contracts Plutus
- CIP-25 NFT Metadata
    `,
    )
    .setVersion('1.0')
    .setContact(
      'MkulimaChain Team',
      'https://mkulimachain.com',
      'contact@mkulimachain.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:5600/api', 'Development Server')
    .addServer('https://api.mkulimachain.com/api', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentification')
    .addTag('farmers', 'Gestion des agriculteurs')
    .addTag('cooperatives', 'Coopératives agricoles')
    .addTag('products', 'Produits agricoles')
    .addTag('harvests', 'Récoltes')
    .addTag('batches', 'Lots de production')
    .addTag('supply-chain', "Chaîne d'approvisionnement")
    .addTag('wallets', 'Portefeuilles')
    .addTag('micro-loans', 'Micro-prêts DeFi')
    .addTag('credit-scores', ' Scores de crédit')
    .addTag('mobile-money', 'Transactions Mobile Money')
    .addTag('marketplace', 'Place de marché')
    .addTag('orders', 'Commandes')
    .addTag('nfts', 'NFTs culturels')
    .addTag('nft-purchases', 'Achats NFT')
    .addTag('school-funds', 'Fonds scolaires')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${globalPrefix}/docs`, app, document, {
    customSiteTitle: 'MkulimaChain API Docs',
    customfavIcon: 'https://mkulimachain.com/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2e7d32; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = process.env.PORT || 5600;
  await app.listen(port);
  console.log(`API is running on: http://localhost:${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
