'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ProfileEditForm({ user, onUpdated }: { user: any, onUpdated: () => void }) {
  const [displayName, setDisplayName] = useState(user.display_name || '')
  const [bio, setBio] = useState(user.bio || '')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)
    const { error } = await supabase
      .from('users')
      .update({ display_name: displayName, bio })
      .eq('id', user.id)
    setLoading(false)
    if (!error) {
      setSuccess(true)
      onUpdated()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-4 shadow-glass mb-8">
      <h3 className="font-heading text-lg text-primary mb-2">Edit Profile</h3>
      <div className="mb-2">
        <label className="block text-text-secondary text-sm mb-1">Display Name</label>
        <input
          className="w-full rounded px-3 py-2 bg-background border border-border text-text-primary"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          maxLength={32}
        />
      </div>
      <div className="mb-2">
        <label className="block text-text-secondary text-sm mb-1">Bio</label>
        <textarea
          className="w-full rounded px-3 py-2 bg-background border border-border text-text-primary"
          value={bio}
          onChange={e => setBio(e.target.value)}
          maxLength={256}
        />
      </div>
      <button
        type="submit"
        className="bg-primary text-black px-4 py-2 rounded font-bold hover:bg-primary-dark transition"
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
      {success && <span className="ml-4 text-green-400">Profile updated!</span>}
    </form>
  )
}