'use client'
import { motion } from 'framer-motion'
import { UserButton } from '@civic/auth/react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useUser } from '@civic/auth/react'
import { useAccount } from 'wagmi'
import { User, Wallet } from 'lucide-react'

export default function Header() {
  const { user } = useUser()
  const { isConnected } = useAccount()

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-glass backdrop-blur-xl border-b border-border/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-xl font-heading font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              SoL-verse
            </span>
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-3">
            {/* Civic Auth Button */}
            <div className="relative">
              {user ? (
                <UserButton />
              ) : (
                <div className="civic-auth-wrapper">
                  <UserButton />
                </div>
              )}
            </div>

            {/* Connect Wallet Button */}
            <div className="relative">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading'
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus ||
                      authenticationStatus === 'authenticated')

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              className="flex items-center gap-2 bg-glass backdrop-blur-xl border border-primary/30 hover:border-primary/60 text-text-primary font-medium px-4 py-2 rounded-glass transition-all duration-300 hover:shadow-glass hover:bg-primary/5"
                            >
                              <Wallet className="w-4 h-4" />
                              <span className="hidden sm:inline">Connect Wallet</span>
                            </button>
                          )
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 font-medium px-4 py-2 rounded-glass transition-all duration-300 hover:bg-red-500/30"
                            >
                              Wrong network
                            </button>
                          )
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={openChainModal}
                              className="flex items-center gap-2 bg-glass backdrop-blur-xl border border-border/50 hover:border-primary/50 text-text-primary font-medium px-3 py-2 rounded-glass transition-all duration-300 hover:shadow-glass"
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 16,
                                    height: 16,
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? 'Chain icon'}
                                      src={chain.iconUrl}
                                      style={{ width: 16, height: 16 }}
                                    />
                                  )}
                                </div>
                              )}
                              <span className="hidden sm:inline">{chain.name}</span>
                            </button>

                            <button
                              onClick={openAccountModal}
                              className="flex items-center gap-2 bg-primary/20 border border-primary/50 text-primary font-medium px-4 py-2 rounded-glass transition-all duration-300 hover:bg-primary/30 hover:shadow-glow/20"
                            >
                              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                              <span className="hidden sm:inline">
                                {account.displayName}
                              </span>
                              <span className="sm:hidden">
                                {account.displayName?.slice(0, 6)}...
                              </span>
                            </button>
                          </div>
                        )
                      })()}
                    </div>
                  )
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
