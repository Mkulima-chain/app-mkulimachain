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

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({
    summary: "S'inscrire",
    description: 'Crée un nouveau compte utilisateur',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compte créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Email ou téléphone déjà utilisé',
  })
  async register(@Body() dto: RegisterDto): Promise<UserResponseDto> {
    return this.authService.register(dto);
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
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Connexion Google',
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
