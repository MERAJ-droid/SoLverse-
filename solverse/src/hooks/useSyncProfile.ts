'use client'
import { useEffect } from 'react'
import { useUser } from '@civic/auth/react'
import { useAccount, useEnsName } from 'wagmi'
import { syncUser } from '@/lib/syncUser'

type CivicUserWithWallets = {
  wallets?: { address: string }[]
  name?: string
  email?: string
}

export function useSyncProfile() {
  const { user } = useUser()
  const { address, isConnected } = useAccount()
  const { data: ens } = useEnsName({ address })

  // Type assertion to allow dynamic wallet property
  useEffect(() => {
    const civicWallet = (user as CivicUserWithWallets)?.wallets?.[0]?.address
    if (civicWallet) {
      syncUser({
        wallet: civicWallet,
        display_name: user?.name || user?.email || undefined,
      })
    }
  }, [user])

  // Sync EVM wallet user
  useEffect(() => {
    if (isConnected && address) {
      syncUser({
        wallet: address,
        ens: ens || undefined,
      })
    }
  }, [isConnected, address, ens])
}