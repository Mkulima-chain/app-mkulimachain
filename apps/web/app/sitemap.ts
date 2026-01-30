import { MetadataRoute } from 'next';
import { locales } from '@/i18n/config';

// Base URL du site - peut être configuré via variable d'environnement
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://app.mkulimachain.com';

// Routes publiques qui doivent être indexées
const publicRoutes = [
    '',
    'marketplace',
    'marketplace/nft',
    'marketplace/mint',
    'login',
    'register',
];

export default function sitemap(): MetadataRoute.Sitemap {
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Pour chaque locale
    locales.forEach((locale) => {
        // Pour chaque route publique
        publicRoutes.forEach((route) => {
            const url = route ? `${baseUrl}/${locale}/${route}` : `${baseUrl}/${locale}`;

            sitemapEntries.push({
                url,
                lastModified: new Date(),
                changeFrequency: route === '' ? 'daily' : 'weekly',
                priority: route === '' ? 1.0 : 0.8,
            });
        });

        // Ajouter également la route sans locale (redirigera vers la locale par défaut)
        if (locale === 'ln') {
            publicRoutes.forEach((route) => {
                const url = route ? `${baseUrl}/${route}` : baseUrl;

                sitemapEntries.push({
                    url,
                    lastModified: new Date(),
                    changeFrequency: route === '' ? 'daily' : 'weekly',
                    priority: route === '' ? 1.0 : 0.8,
                });
            });
        }
    });

    return sitemapEntries;
}

