import { supabase } from './supabaseClient'

/**
 * Upserts a user into the Supabase users table.
 * @param wallet - The user's wallet address (required)
 * @param display_name - The user's display name (optional)
 * @param ens - The user's ENS name (optional)
 */
export async function syncUser({
  wallet,
  display_name,
  ens,
}: {
  wallet: string
  display_name?: string
  ens?: string
}) {
  if (!wallet) return

  const { error } = await supabase
    .from('users')
    .upsert(
      [{ wallet, display_name, ens }],
      { onConflict: 'wallet' }
    )

  if (error) {
    // You may want to send this to an error reporting service in production
    console.error('Error syncing user:', error)
  }
}