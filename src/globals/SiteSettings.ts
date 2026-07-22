import type { GlobalConfig } from 'payload'

import { allowPublicRead, isAuthenticated } from '../access'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: allowPublicRead,
    update: isAuthenticated,
  },
  hooks: {
    afterChange: [revalidateGlobal('site-settings')],
  },
  fields: [
    { name: 'siteName', type: 'text' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'primaryColor', type: 'text' },
    {
      name: 'email',
      type: 'group',
      label: 'Emails & notifications',
      admin: {
        description:
          "Adresses utilisées pour l'envoi des emails de formulaire. Laisser vide pour utiliser les valeurs par défaut de l'environnement.",
      },
      fields: [
        { name: 'fromName', type: 'text', label: "Nom de l'expéditeur" },
        { name: 'fromAddress', type: 'email', label: "Adresse d'expédition" },
        {
          name: 'notificationRecipient',
          type: 'email',
          label: 'Destinataire par défaut',
          admin: { description: 'Utilisé quand un destinataire spécifique par type n’est pas défini.' },
        },
        { name: 'contactRecipient', type: 'email', label: 'Destinataire — Contact' },
        { name: 'quoteRecipient', type: 'email', label: 'Destinataire — Devis' },
        { name: 'reservationRecipient', type: 'email', label: 'Destinataire — Réservation' },
      ],
    },
    {
      name: 'contact',
      type: 'group',
      label: 'Coordonnées',
      fields: [
        { name: 'phone', type: 'text', label: 'Téléphone' },
        { name: 'email', type: 'email', label: 'Email public' },
        { name: 'addressLine', type: 'text', label: 'Adresse' },
        { name: 'city', type: 'text', label: 'Ville' },
        { name: 'mapUrl', type: 'text', label: 'Lien Google Maps' },
      ],
    },
    {
      name: 'social',
      type: 'group',
      label: 'Réseaux sociaux',
      fields: [
        { name: 'instagram', type: 'text', label: 'Instagram' },
        { name: 'linkedin', type: 'text', label: 'LinkedIn' },
        { name: 'tiktok', type: 'text', label: 'TikTok' },
        { name: 'youtube', type: 'text', label: 'YouTube' },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      label: 'Analytics',
      fields: [{ name: 'gaMeasurementId', type: 'text', label: 'Google Analytics ID' }],
    },
    {
      name: 'showreel',
      type: 'group',
      label: 'Showreel (accueil)',
      fields: [
        { name: 'video', type: 'upload', relationTo: 'media', label: 'Vidéo (téléversée)' },
        { name: 'poster', type: 'upload', relationTo: 'media', label: 'Image de couverture (téléversée)' },
        {
          name: 'videoUrl',
          type: 'text',
          label: 'Vidéo (URL ou chemin)',
          admin: { description: "Utilisé si aucune vidéo n'est téléversée. Ex: /videos/showreel.mp4" },
        },
        { name: 'posterUrl', type: 'text', label: 'Image de couverture (URL ou chemin)' },
      ],
    },
  ],
}
