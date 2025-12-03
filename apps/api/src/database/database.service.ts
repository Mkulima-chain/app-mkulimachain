import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  /**
   * Vérifie la connexion à la base de données
   */
  async isConnected(): Promise<boolean> {
    try {
      return this.dataSource.isInitialized;
    } catch (error) {
      return false;
    }
  }

  /**
   * Exécute une requête de test
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        success: true,
        message: 'Database connection successful',
      };
    } catch (error) {
      return {
        success: false,
        message: `Database connection failed: ${error.message}`,
      };
    }
  }

  /**
   * Obtient les informations de la base de données
   */
  async getDatabaseInfo(): Promise<{
    database: string;
    isConnected: boolean;
    driver: string;
  }> {
    return {
      database: this.dataSource.options.database as string,
      isConnected: this.dataSource.isInitialized,
      driver: this.dataSource.options.type,
    };
  }
}
