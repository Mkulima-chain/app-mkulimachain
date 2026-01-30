import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Mkulima Chain - Marketplace décentralisée',
        short_name: 'Mkulima Chain',
        description: 'Plateforme Cardano connectant directement les producteurs de cacao, café et manioc aux acheteurs internationaux',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#3A8F4C',
        icons: [
            {
                src: '/logo-mkulima-leaf.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/logo-mkulima-leaf.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}

