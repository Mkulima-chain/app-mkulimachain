import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IPFSUploadResult {
  cid: string;
  path: string;
  size: number;
}

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  imageHash?: string;
  audio?: string;
  audioHash?: string;
  animation_url?: string;
  external_url?: string;
  attributes?: Array<{ trait_type: string; value: string | number }>;
  [key: string]: any;
}

@Injectable()
export class IPFSService {
  private readonly logger = new Logger(IPFSService.name);
  private pinataApiKey?: string;
  private pinataSecretKey?: string;
  private pinataJWT?: string;
  private pinataGateway: string;

  constructor(private configService: ConfigService) {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    this.pinataApiKey = this.configService.get<string>('IPFS_PROJECT_ID');
    this.pinataSecretKey = this.configService.get<string>(
      'IPFS_PROJECT_SECRET',
    );
    this.pinataJWT = this.configService.get<string>('IPFS_JWT');
    this.pinataGateway =
      this.configService.get<string>('IPFS_GATEWAY') ||
      'https://gateway.pinata.cloud/ipfs/';

    if (!this.pinataJWT && (!this.pinataApiKey || !this.pinataSecretKey)) {
      this.logger.warn(
        'Pinata credentials not fully configured. IPFS uploads may fail.',
      );
    } else {
      this.logger.log('Pinata IPFS service initialized');
    }
  }

  /**
   * Récupère les headers d'authentification Pinata
   */
  private getPinataHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};

    // Utiliser JWT si disponible (priorité), sinon API keys
    if (this.pinataJWT) {
      headers['Authorization'] = `Bearer ${this.pinataJWT}`;
    } else if (this.pinataApiKey && this.pinataSecretKey) {
      headers['pinata_api_key'] = this.pinataApiKey;
      headers['pinata_secret_api_key'] = this.pinataSecretKey;
    } else {
      throw new BadRequestException(
        'Pinata credentials not configured. Please set IPFS_JWT or IPFS_PROJECT_ID and IPFS_PROJECT_SECRET',
      );
    }

    return headers;
  }

  /**
   * Upload un fichier sur Pinata IPFS
   */
  async uploadFile(
    file: Express.Multer.File | Buffer,
    filename?: string,
  ): Promise<IPFSUploadResult> {
    const FormData = (await import('form-data')).default;
    const axios = (await import('axios')).default;

    const fileBuffer = Buffer.isBuffer(file) ? file : file.buffer;
    const fileName =
      filename || (Buffer.isBuffer(file) ? 'file' : file.originalname);

    const formData = new FormData();
    formData.append('file', fileBuffer, fileName);

    const headers = {
      ...formData.getHeaders(),
      ...this.getPinataHeaders(),
    };

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        { headers },
      );

      const cid = response.data.IpfsHash;
      this.logger.log(`File uploaded to Pinata IPFS: ${cid}`);

      return {
        cid,
        path: cid,
        size: response.data.PinSize || fileBuffer.length,
      };
    } catch (error: any) {
      this.logger.error(
        'Error uploading file to Pinata',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        `Failed to upload file to Pinata: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Upload plusieurs fichiers sur Pinata IPFS
   */
  async uploadFiles(
    files: Express.Multer.File[] | Buffer[],
  ): Promise<IPFSUploadResult[]> {
    const uploadPromises = files.map((file, index) => {
      const fileName = Buffer.isBuffer(file)
        ? `file-${index}`
        : file.originalname;
      return this.uploadFile(file, fileName);
    });

    const results = await Promise.all(uploadPromises);
    this.logger.log(`Uploaded ${results.length} files to Pinata IPFS`);
    return results;
  }

  /**
   * Upload des métadonnées JSON sur Pinata IPFS
   */
  async uploadMetadata(metadata: NFTMetadata): Promise<IPFSUploadResult> {
    const axios = (await import('axios')).default;

    const headers = {
      'Content-Type': 'application/json',
      ...this.getPinataHeaders(),
    };

    try {
      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        metadata,
        { headers },
      );

      const cid = response.data.IpfsHash;
      const ipfsUri = `ipfs://${cid}`;
      this.logger.log(`Metadata uploaded to Pinata IPFS: ${ipfsUri}`);

      return {
        cid,
        path: cid,
        size: JSON.stringify(metadata).length,
      };
    } catch (error: any) {
      this.logger.error(
        'Error uploading metadata to Pinata',
        error.response?.data || error.message,
      );
      throw new BadRequestException(
        `Failed to upload metadata to Pinata: ${error.response?.data?.error || error.message}`,
      );
    }
  }

  /**
   * Upload un NFT complet (fichiers + métadonnées) sur Pinata IPFS
   */
  async uploadNFT(
    metadata: NFTMetadata,
    imageFile?: Express.Multer.File | Buffer,
    audioFile?: Express.Multer.File | Buffer,
  ): Promise<{ metadataURI: string; imageHash?: string; audioHash?: string }> {
    try {
      // Upload de l'image si fournie
      let imageHash: string | undefined;
      if (imageFile) {
        const imageResult = await this.uploadFile(imageFile, 'image');
        imageHash = imageResult.cid;
        metadata.image = `ipfs://${imageHash}`;
        metadata.imageHash = imageHash;
      }

      // Upload de l'audio si fourni
      let audioHash: string | undefined;
      if (audioFile) {
        const audioResult = await this.uploadFile(audioFile, 'audio');
        audioHash = audioResult.cid;
        metadata.audio = `ipfs://${audioHash}`;
        metadata.audioHash = audioHash;
      }

      // Upload des métadonnées
      const metadataResult = await this.uploadMetadata(metadata);
      const metadataURI = `ipfs://${metadataResult.cid}`;

      return {
        metadataURI,
        imageHash,
        audioHash,
      };
    } catch (error) {
      this.logger.error('Error uploading NFT to Pinata IPFS', error);
      throw new BadRequestException(
        `Failed to upload NFT to Pinata IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Récupère un fichier depuis Pinata IPFS via le gateway
   */
  async getFile(cid: string): Promise<Buffer> {
    const axios = (await import('axios')).default;

    try {
      const url = this.getIPFSUrl(cid);
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error(
        `Error retrieving file from Pinata IPFS: ${cid}`,
        error,
      );
      throw new BadRequestException(
        `Failed to retrieve file from Pinata IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Récupère des métadonnées depuis Pinata IPFS
   */
  async getMetadata(cid: string): Promise<NFTMetadata> {
    try {
      const fileBuffer = await this.getFile(cid);
      const metadata = JSON.parse(fileBuffer.toString('utf-8'));
      return metadata;
    } catch (error) {
      this.logger.error(
        `Error retrieving metadata from Pinata IPFS: ${cid}`,
        error,
      );
      throw new BadRequestException(
        `Failed to retrieve metadata from Pinata IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  /**
   * Convertit un CID en URL IPFS via le gateway Pinata
   */
  getIPFSUrl(cid: string, gateway?: string): string {
    const ipfsGateway = gateway || this.pinataGateway;
    return `${ipfsGateway}${cid}`;
  }

  /**
   * Convertit une URI IPFS en URL HTTP
   */
  ipfsUriToHttpUrl(ipfsUri: string, gateway?: string): string {
    if (!ipfsUri.startsWith('ipfs://')) {
      return ipfsUri;
    }

    const cid = ipfsUri.replace('ipfs://', '');
    return this.getIPFSUrl(cid, gateway);
  }
}
