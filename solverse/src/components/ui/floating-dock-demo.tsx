'use client'
import React from "react";
import { FloatingDock } from "@/components/ui/floating-dock";
import {
  IconHome,
  IconNews,
  IconShieldCheck,
  IconTrophy,
  IconUser,
} from "@tabler/icons-react";
import { useUser } from '@civic/auth/react'
import { useAccount } from 'wagmi'

export default function FloatingDockDemo() {
  const { user } = useUser()
  const { address, isConnected } = useAccount()

  // Get the current user's wallet address
  const getCurrentWallet = () => {
    // First check for Civic wallet
    const civicWallet = (user as any)?.wallets?.[0]?.address
    if (civicWallet) return civicWallet
    
    // Then check for connected EVM wallet
    if (isConnected && address) return address
    
    // Fallback - this shouldn't happen if user is authenticated
    return 'unknown'
  }

  const currentWallet = getCurrentWallet()

  const links = [
    {
      title: "Home",
      icon: (
        <IconHome className="h-full w-full text-primary" />
      ),
      href: "/",
    },
    {
      title: "Feed",
      icon: (
        <IconNews className="h-full w-full text-primary" />
      ),
      href: "/feed",
    },
    {
      title: "Verify",
      icon: (
        <IconShieldCheck className="h-full w-full text-primary" />
      ),
      href: "/verify",
    },
    {
      title: "Leaderboard",
      icon: (
        <IconTrophy className="h-full w-full text-primary" />
      ),
      href: "/leaderboard",
    },
    {
      title: "Profile",
      icon: (
        <IconUser className="h-full w-full text-primary" />
      ),
      href: `/profile/${currentWallet}`,
    },
  ];

  return (
    <FloatingDock items={links} />
  );
}
