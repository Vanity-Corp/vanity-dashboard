import type { Access, FieldAccess } from 'payload'

/**
 * Shared access-control helpers.
 *
 * Payload's Local API (`payload.create` / `payload.update` from server code such as
 * our form endpoints) bypasses access control by default, so `denyAll` on `create`
 * blocks the admin UI / REST / GraphQL while still allowing server-side persistence.
 */

/** Any authenticated user (has a valid session). */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)

/** Admins only. */
export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

/** Admins, or the user acting on their own record. */
export const isAdminOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  return { id: { equals: user.id } }
}

/** Blocks the operation for everyone via the access layer (Local API still works). */
export const denyAll: Access = () => false

/** Public read (used later by the headless content API). */
export const allowPublicRead: Access = () => true

/** Field-level: only admins may write this field. */
export const isAdminFieldLevel: FieldAccess = ({ req: { user } }) => user?.role === 'admin'
