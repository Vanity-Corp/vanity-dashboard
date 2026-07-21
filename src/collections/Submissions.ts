import type { CollectionConfig } from 'payload'

import { denyAll, isAdmin, isAuthenticated } from '../access'

/**
 * Unified, system-generated log of every public form submission
 * (contact / quote / reservation). Replaces the former Leads,
 * QuoteRequests and StudioBookings collections.
 *
 * Rules (see docs/integration-plan.md §"Email Collection Rules"):
 *  - create: denied via access layer — records are ONLY created by the server
 *    (Local API bypasses access control). This also hides "Create new" in admin.
 *  - read: any authenticated staff user.
 *  - update: admins only — and only the triage field `lifecycle` is editable
 *    (all captured fields are readOnly in the admin UI).
 *  - delete: admins only.
 *
 * `status` = email delivery outcome (system-set). In Phase 1 every new record is
 * `pending` because sending is not yet wired; Phase 2 (Nodemailer) flips it to
 * `sent` / `failed`.
 */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: {
    singular: 'Soumission',
    plural: 'Soumissions',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['type', 'name', 'email', 'status', 'lifecycle', 'createdAt'],
    group: 'Soumissions',
  },
  access: {
    create: denyAll,
    read: isAuthenticated,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: 'type',
      type: 'select',
      label: 'Type',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Devis', value: 'quote' },
        { label: 'Réservation', value: 'reservation' },
      ],
      admin: { readOnly: true },
    },
    { name: 'name', type: 'text', label: 'Nom', admin: { readOnly: true } },
    { name: 'email', type: 'email', label: 'Email', required: true, admin: { readOnly: true } },
    { name: 'phone', type: 'text', label: 'Téléphone', admin: { readOnly: true } },
    { name: 'message', type: 'textarea', label: 'Message', admin: { readOnly: true } },
    { name: 'clientType', type: 'text', label: 'Type de client', admin: { readOnly: true } },
    {
      name: 'projectType',
      type: 'text',
      label: 'Type de projet',
      admin: { readOnly: true, condition: (data) => data?.type === 'quote' },
    },
    {
      name: 'budget',
      type: 'text',
      label: 'Budget',
      admin: { readOnly: true, condition: (data) => data?.type === 'quote' },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Fonctionnalités',
      admin: { readOnly: true, condition: (data) => data?.type === 'quote' },
      fields: [{ name: 'value', type: 'text' }],
    },
    {
      name: 'date',
      type: 'date',
      label: 'Date',
      admin: { readOnly: true, condition: (data) => data?.type === 'reservation' },
    },
    {
      name: 'hours',
      type: 'array',
      label: 'Créneaux',
      admin: { readOnly: true, condition: (data) => data?.type === 'reservation' },
      fields: [{ name: 'value', type: 'text' }],
    },
    {
      name: 'status',
      type: 'select',
      label: "Statut d'envoi",
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Envoyé', value: 'sent' },
        { label: 'Échec', value: 'failed' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'lifecycle',
      type: 'select',
      label: 'Suivi',
      defaultValue: 'new',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'En cours', value: 'in-progress' },
        { label: 'Clos', value: 'closed' },
      ],
    },
    {
      // Drives the sidebar notification badge. New submissions are unread;
      // opening the corresponding tab marks that type's submissions read.
      name: 'read',
      type: 'checkbox',
      label: 'Lu',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    { name: 'raw', type: 'json', label: 'Données brutes', admin: { readOnly: true } },
  ],
}
