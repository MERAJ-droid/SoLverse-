'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAccount, useSignMessage } from 'wagmi'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Link from 'next/link'
import { useReputationOracle } from '@/lib/useReputationOracle'
import { parseEther } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ExternalLink, Users, Zap, CheckCircle, AlertCircle, Clock, Coins } from 'lucide-react'
import { Footer } from '@/components/Footer'

type User = {
  id: string
  wallet: string
  display_name: string | null
  ens: string | null
}

type Contribution = {
  id: string
  user_id: string
  dao: string
  reason: string
  proof?: string | null
  created_at: string
  status: string
  user: User
}

type Verification = {
  id: string
  contribution_id: string
  verifier_id: string
  user_id: string
}

export default function FeedPage() {
  const { address } = useAccount()
  const { signMessageAsync } = useSignMessage()
  const { submitVerification, getTrustScore } = useReputationOracle()
  const [contributions, setContributions] = useState<(Contribution & {
    verifications: Verification[]
  })[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<null | (Contribution & { verifications: Verification[] })>(null)
  const [modalTrustScore, setModalTrustScore] = useState<number | null>(null)
  const [modalVerifiers, setModalVerifiers] = useState<User[]>([])

  // Fetch all contributions with user info and verifications
  useEffect(() => {
    async function fetchFeed() {
      setLoading(true)
      setError(null)
      const { data: contribs, error: cErr } = await supabase
        .from('contributions')
        .select('*, user:user_id(id, wallet, display_name, ens)')
        .order('created_at', { ascending: false })

      if (cErr || !contribs) {
        setContributions([])
        setError('Failed to load contributions.')
        setLoading(false)
        return
      }

      const ids = contribs.map((c: Contribution) => c.id)
      const { data: verifications } = await supabase
        .from('verifications')
        .select('id, contribution_id, verifier_id, user_id')
        .in('contribution_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])

      const contributions = contribs.map((c: Contribution) => ({
        ...c,
        verifications: (verifications || []).filter(v => v.contribution_id === c.id)
      }))

      setContributions(contributions)
      setLoading(false)
    }
    fetchFeed()
  }, [])

  // Get current user's uuid (from users table)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  useEffect(() => {
    async function fetchUserId() {
      if (!address) return setCurrentUserId(null)
      const { data } = await supabase
        .from('users')
        .select('id')
        .eq('wallet', address)
        .single()
      setCurrentUserId(data?.id || null)
    }
    fetchUserId()
  }, [address])

  // Handle verification
  async function handleVerify(contribution: Contribution) {
  if (!currentUserId) return
  setVerifying(contribution.id)
  setError(null)
  try {
    const { data: user } = await supabase
      .from('users')
      .select('wallet')
      .eq('id', contribution.user_id)
      .single()
    const subjectWallet = user?.wallet
    if (!subjectWallet) throw new Error('Contributor wallet not found.')

    // Pass 0.01 AVAX with the transaction
    await submitVerification(
      subjectWallet,
      contribution.reason,
      contribution.id, // UUID
      { value: parseEther('0.01') }
    )

    const message = `I verify the contribution for DAO: ${contribution.dao}\nReason: ${contribution.reason}\nBy: ${subjectWallet}`
    const signature = await signMessageAsync({ message })

    await supabase.from('verifications').insert({
      contribution_id: contribution.id,
      user_id: contribution.user_id,
      verifier_id: currentUserId,
      reason: contribution.reason,
      dao: contribution.dao,
      date: new Date().toISOString(),
      signature
    })

    const { data: verifications } = await supabase
      .from('verifications')
      .select('id, contribution_id, verifier_id, user_id')
      .eq('contribution_id', contribution.id)
    setContributions(contributions =>
      contributions.map(c =>
        c.id === contribution.id
          ? { ...c, verifications: verifications || [] }
          : c
      )
    )
  } catch (err: any) {
    setError(err?.message || 'Verification failed.')
  }
  setVerifying(null)
}

  // Modal: fetch trust score and verifiers
  useEffect(() => {
    async function fetchModalDetails() {
      if (!modal) return
      setModalTrustScore(null)
      setModalVerifiers([])
      try {
        const score = await getTrustScore(modal.user.wallet)
        setModalTrustScore(Number(score))
        if (modal.verifications.length > 0) {
          const verifierIds = modal.verifications.map(v => v.verifier_id)
          const { data: users } = await supabase
            .from('users')
            .select('id, wallet, display_name, ens')
            .in('id', verifierIds)
          setModalVerifiers(users || [])
        }
      } catch {
        setModalTrustScore(null)
        setModalVerifiers([])
      }
    }
    fetchModalDetails()
    // eslint-disable-next-line
  }, [modal])

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/3 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -80],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Users className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Community Feed</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            📰 Contribution{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Feed
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Discover and verify the latest Web3 contributions from the community
          </p>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-700/50 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-700/30 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-700/30 rounded w-full"></div>
                  <div className="h-4 bg-slate-700/30 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Contributions Feed */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {contributions.map((contrib, index) => {
              const alreadyVerified = !!contrib.verifications.find(v => v.verifier_id === currentUserId)
              const isOwn = currentUserId === contrib.user_id
              
              return (
                <motion.div
                  key={contrib.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="group relative"
                >
                  <div
                    className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-slate-600/30 hover:bg-slate-900/40 transition-all duration-300 cursor-pointer"
                    onClick={() => setModal(contrib)}
                  >
                    {/* User Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        {contrib.user.ens ? (
                          <img
                            src={`https://metadata.ens.domains/mainnet/avatar/${contrib.user.ens}`}
                            alt={contrib.user.ens}
                            className="w-10 h-10 rounded-full border border-slate-600/30"
                            onError={e => (e.currentTarget.style.display = 'none')}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full border border-slate-600/30 overflow-hidden">
                            <Jazzicon diameter={40} seed={jsNumberForAddress(contrib.user.wallet)} />
                          </div>
                        )}
                        
                        <div>
                          <Link
                            href={`/profile/${contrib.user.wallet}`}
                            className="font-semibold text-text-primary hover:text-primary transition-colors duration-200"
                            onClick={e => e.stopPropagation()}
                          >
                            {contrib.user.display_name || contrib.user.ens || contrib.user.wallet.slice(0, 6) + '...' + contrib.user.wallet.slice(-4)}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(contrib.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-1.5">
                        <div className="text-xs text-text-secondary/60 mb-0.5">Status</div>
                        <div className="text-sm font-medium text-text-primary">{contrib.status}</div>
                      </div>
                    </div>

                    {/* DAO Badge */}
                    <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-1.5 mb-4">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="text-sm font-medium text-primary">{contrib.dao}</span>
                    </div>

                    {/* Contribution Content */}
                    <div className="mb-6">
                      <p className="text-text-primary leading-relaxed">{contrib.reason}</p>
                    </div>

                    {/* Verification Stats & Actions */}
                    <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-green-400">
                              {contrib.verifications.length}
                            </div>
                            <div className="text-xs text-text-secondary">
                              verification{contrib.verifications.length === 1 ? '' : 's'}
                            </div>
                          </div>
                        </div>

                        {/* Verification Avatars */}
                        {contrib.verifications.length > 0 && (
                          <div className="flex -space-x-2">
                            {contrib.verifications.slice(0, 3).map((v, idx) => (
                              <div
                                key={v.id}
                                className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-text-secondary"
                                title={v.verifier_id === currentUserId ? 'You' : 'Verifier'}
                              >
                                {v.verifier_id === currentUserId ? '✓' : idx + 1}
                              </div>
                            ))}
                            {contrib.verifications.length > 3 && (
                              <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-xs text-text-secondary">
                                +{contrib.verifications.length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {!isOwn && !alreadyVerified && currentUserId && (
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            disabled={verifying === contrib.id}
                            onClick={e => {
                              e.stopPropagation()
                              handleVerify(contrib)
                            }}
                          >
                            {verifying === contrib.id ? (
                              <>
                                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                                <span>Verifying...</span>
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4" />
                                <span>Verify</span>
                              </>
                            )}
                          </motion.button>
                        )}

                        {isOwn && (
                          <div className="flex items-center gap-2 text-xs text-text-secondary bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-2">
                            <Clock className="w-3 h-3" />
                            <span>Your contribution</span>
                          </div>
                        )}

                        {alreadyVerified && !isOwn && (
                          <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
                            <CheckCircle className="w-3 h-3" />
                            <span>Verified by you</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* AVAX Cost Notice */}
                    {!isOwn && !alreadyVerified && currentUserId && (
                      <div className="mt-4 pt-4 border-t border-slate-700/20">
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                          <Coins className="w-3 h-3 text-primary" />
                          <span>Verification requires 0.01 AVAX stake</span>
                        </div>
                      </div>
                    )}

                    {/* Hover Arrow */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <ExternalLink className="w-3 h-3 text-primary" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && contributions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No contributions yet</h3>
            <p className="text-text-secondary mb-6">Be the first to share your Web3 contributions!</p>
            <button className="bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              Submit Contribution
            </button>
          </motion.div>
        )}
      </div>

      {/* Enhanced Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/20 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-text-primary">Contribution Details</h2>
                  <button
                    onClick={() => setModal(null)}
                    className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 flex items-center justify-center transition-all duration-200 text-text-secondary hover:text-text-primary"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="flex items-center gap-4">
                  {modal.user.ens ? (
                    <img
                      src={`https://metadata.ens.domains/mainnet/avatar/${modal.user.ens}`}
                      alt={modal.user.ens}
                      className="w-12 h-12 rounded-full border border-slate-600/30"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full border border-slate-600/30 overflow-hidden">
                      <Jazzicon diameter={48} seed={jsNumberForAddress(modal.user.wallet)} />
                    </div>
                  )}
                  <div className="flex-1">
                    <Link
                      href={`/profile/${modal.user.wallet}`}
                      className="font-semibold text-text-primary hover:text-primary transition-colors duration-200 text-lg"
                    >
                      {modal.user.display_name || modal.user.ens || modal.user.wallet.slice(0, 6) + '...' + modal.user.wallet.slice(-4)}
                    </Link>
                    <div className="text-xs text-text-secondary font-mono bg-slate-800/40 rounded px-2 py-1 mt-1 inline-block">
                      {modal.user.wallet}
                    </div>
                  </div>
                </div>

                {/* Contribution Details */}
                <div className="space-y-4">
                  <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                    <div className="text-sm text-text-secondary mb-2">Description</div>
                    <p className="text-text-primary leading-relaxed">{modal.reason}</p>
                  </div>

                  {modal.proof && (
                    <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                      <div className="text-sm text-text-secondary mb-2">Proof</div>
                      <a
                        href={modal.proof}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm break-all flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4 flex-shrink-0" />
                        {modal.proof}
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                      <div className="text-sm text-text-secondary mb-2">DAO</div>
                      <div className="text-text-primary font-medium">{modal.dao}</div>
                    </div>
                    <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                      <div className="text-sm text-text-secondary mb-2">Submitted</div>
                      <div className="text-text-primary font-medium text-sm">
                        {new Date(modal.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                    <div className="text-sm text-text-secondary mb-2">Trust Score</div>
                    <div className="text-text-primary font-medium">
                      {modalTrustScore !== null ? (
                        <span className="text-green-400 font-bold text-lg">{modalTrustScore}</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-text-secondary/30 border-t-text-secondary rounded-full animate-spin"></div>
                          <span className="text-text-secondary">Loading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verifications */}
                <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-text-secondary">Verifications</div>
                    <div className="text-sm font-medium text-green-400">
                      {modal.verifications.length} total
                    </div>
                  </div>
                  
                  {modal.verifications.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 rounded-xl bg-slate-700/30 border border-slate-600/20 flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-text-secondary" />
                      </div>
                      <p className="text-text-secondary text-sm">No verifications yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {modal.verifications.map(v => {
                        const user = modalVerifiers.find(u => u.id === v.verifier_id)
                        return (
                          <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-700/20 border border-slate-600/20 rounded-lg">
                            {user?.ens ? (
                              <img
                                src={`https://metadata.ens.domains/mainnet/avatar/${user.ens}`}
                                alt={user.ens}
                                className="w-8 h-8 rounded-full border border-slate-600/30"
                                onError={e => (e.currentTarget.style.display = 'none')}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full border border-slate-600/30 overflow-hidden">
                                <Jazzicon diameter={32} seed={jsNumberForAddress(user?.wallet || '')} />
                              </div>
                            )}
                            <div className="flex-1">
                              <Link
                                href={`/profile/${user?.wallet}`}
                                className="text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                              >
                                {user?.display_name || user?.ens || (user?.wallet?.slice(0, 6) + '...' + user?.wallet?.slice(-4))}
                              </Link>
                            </div>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Footer />
    </main>
  )
}