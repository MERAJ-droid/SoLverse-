'use client'
import ProfileClient from './ProfileClient'
import { use } from 'react'

export default function ProfilePage({ params }: { params: Promise<{ wallet: string }> }) {
  const { wallet } = use(params)
  return <ProfileClient wallet={wallet} />
}
