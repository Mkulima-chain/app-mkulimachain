
import { DataSource } from 'typeorm';
import { UserEntity } from '../modules/auth/entities/user.entity';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'mkulimachain',
    entities: [ UserEntity ],
    synchronize: false,
});

async function cleanInvalidUsers() {
    try {
        await dataSource.initialize();
        console.log('Connected to database');

        const userRepository = dataSource.getRepository(UserEntity);

        // Find users with non-UUID IDs (this depends on the DB allowing type mixing or checking string format)
        // Since the column is varchar or uuid, we can check format.
        const allUsers = await userRepository.find();

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        const invalidUsers = allUsers.filter(u => !uuidRegex.test(u.id));

        if (invalidUsers.length > 0) {
            console.log(`Found ${invalidUsers.length} users with invalid UUIDs. Deleting...`);
            for (const user of invalidUsers) {
                console.log(`Deleting user ${user.email} (ID: ${user.id})`);
                await userRepository.delete(user.id);
            }
            console.log('Clean up complete.');
        } else {
            console.log('No invalid users found.');
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await dataSource.destroy();
    }
}

cleanInvalidUsers();
