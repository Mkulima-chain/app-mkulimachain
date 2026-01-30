import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import {
  RegisterDto,
  LoginDto,
  UpdateUserDto,
  ChangePasswordDto,
  LoginResponseDto,
  UserResponseDto,
} from '../dto/auth.dto';
import { WalletConnectDto } from '../dto/wallet-auth.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Public } from '../decorators/public.decorator';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../interfaces/iuser';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "S'inscrire",
    description:
      "Crée un nouveau compte utilisateur et retourne les tokens JWT. Si aucun admin n'existe, permet de créer le premier compte admin.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compte créé avec succès',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email ou téléphone déjà utilisé',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Tentative de créer un compte admin alors que des admins existent déjà',
  })
  async register(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    // Si l'utilisateur essaie de créer un compte admin, vérifier s'il n'y a pas encore d'admin
    if (dto.role === UserRole.ADMIN) {
      return this.authService.createFirstAdmin(dto);
    }
    return this.authService.register(dto);
  }

  @Public()
  @Get('admin/check')
  @ApiOperation({
    summary: 'Vérifier si des admins existent',
    description:
      "Vérifie s'il existe des comptes administrateur dans le système.",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Statut de l'existence des admins",
    schema: {
      type: 'object',
      properties: {
        hasAdmins: { type: 'boolean' },
      },
    },
  })
  async checkAdmins(): Promise<{ hasAdmins: boolean }> {
    const hasAdmins = await this.authService.hasAdmins();
    return { hasAdmins };
  }

  @Public()
  @Post('admin/first')
  @ApiOperation({
    summary: 'Créer le premier compte administrateur',
    description:
      "Crée le premier compte administrateur. Ne fonctionne que s'il n'existe aucun admin dans le système.",
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Premier compte admin créé avec succès',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Des comptes admin existent déjà',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email ou téléphone déjà utilisé',
  })
  async createFirstAdmin(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    return this.authService.createFirstAdmin(dto);
  }

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Se connecter',
    description: 'Authentifie un utilisateur et retourne les tokens JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion réussie',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Identifiants invalides',
  })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({
    summary: 'Rafraîchir le token',
    description: 'Génère un nouveau access token à partir du refresh token',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refreshToken: {
          type: 'string',
          example: 'refresh-token-123456',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token rafraîchi',
    type: LoginResponseDto,
  })
  async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<LoginResponseDto> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Se déconnecter',
    description: 'Invalide le refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Déconnexion réussie',
  })
  async logout(@CurrentUser() user: UserEntity): Promise<void> {
    return this.authService.logout(user.id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtenir le profil',
    description: 'Récupère les informations du utilisateur connecté',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil utilisateur',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: UserEntity): Promise<UserResponseDto> {
    return this.authService.getProfile(user.id);
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mettre à jour le profil',
    description: 'Modifie les informations du profil utilisateur',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Profil mis à jour',
    type: UserResponseDto,
  })
  async updateProfile(
    @CurrentUser() user: UserEntity,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.authService.updateProfile(user.id, dto);
  }

  @Put('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Changer le mot de passe',
    description: "Modifie le mot de passe de l'utilisateur",
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mot de passe modifié',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ancien mot de passe invalide',
  })
  async changePassword(
    @CurrentUser() user: UserEntity,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    return this.authService.changePassword(user.id, dto);
  }

  @Post('admin/create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Créer un compte administrateur',
    description:
      'Crée un nouveau compte administrateur. Accessible uniquement aux administrateurs existants.',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compte administrateur créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Seuls les administrateurs peuvent créer des comptes admin',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email ou téléphone déjà utilisé',
  })
  async createAdminAccount(
    @CurrentUser() currentAdmin: UserEntity,
    @Body() dto: RegisterDto,
  ): Promise<UserResponseDto> {
    return this.authService.createAdminAccount(currentAdmin, dto);
  }

  @Public()
  @Post('wallet/connect')
  @ApiOperation({
    summary: 'Connexion avec wallet Cardano',
    description: 'Connecte un utilisateur via son portefeuille Cardano (Web3)',
  })
  @ApiBody({ type: WalletConnectDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion wallet réussie',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Signature invalide',
  })
  async walletConnect(
    @Body() dto: WalletConnectDto,
  ): Promise<LoginResponseDto> {
    return this.authService.walletConnect(dto);
  }

  @Public()
  @Post('google')
  @ApiOperation({
    summary: 'Inscription/Connexion avec Google',
    description: 'Crée ou connecte un utilisateur avec Google OAuth',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Jean Mukendi' },
        email: { type: 'string', example: 'jean.mukendi@gmail.com' },
        image: { type: 'string', example: 'https://...' },
        providerId: { type: 'string', example: '123456789' },
        role: {
          type: 'string',
          enum: ['FARMER', 'BUYER', 'COOPERATIVE', 'SCHOOL'],
          example: 'BUYER',
        },
      },
      required: ['email', 'providerId'],
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Connexion Google réussie',
    type: LoginResponseDto,
  })
  async googleAuthPost(
    @Body()
    body: {
      name?: string;
      email: string;
      image?: string;
      providerId: string;
      role?: string;
    },
  ): Promise<LoginResponseDto> {
    // Extraire le prénom et nom depuis le nom complet
    const nameParts = body.name?.split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || firstName;

    return this.authService.googleAuth({
      googleId: body.providerId,
      email: body.email,
      firstName,
      lastName,
      picture: body.image,
      role: body.role as any,
    });
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Connexion Google OAuth',
    description: 'Redirige vers Google OAuth',
  })
  async googleAuth() {
    // Passport redirige automatiquement
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Callback Google OAuth',
    description: 'Gère le retour de Google OAuth',
  })
  async googleAuthCallback(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const user = req.user as any;
    const result = await this.authService.googleAuth({
      googleId: user.googleId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      picture: user.picture,
    });

    // Rediriger vers le frontend avec les tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5601';
    res.redirect(
      `${frontendUrl}/auth/callback?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`,
    );
  }
}
