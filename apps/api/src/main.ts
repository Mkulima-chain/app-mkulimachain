import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for frontend and admin
  const allowedOrigins = process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:5601', 'http://localhost:5602'];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
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
    .addServer('http://localhost:5600', 'Development Server')
    .addServer('https://api.mkulimachain.com', 'Production Server')
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
  SwaggerModule.setup('api/docs', app, document, {
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
