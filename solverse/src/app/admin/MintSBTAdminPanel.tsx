'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useSoulboundToken } from '@/lib/useSoulboundToken'
import { supabase } from '@/lib/supabaseClient'
import { useSignMessage } from 'wagmi'
import { useReputationOracle } from '@/lib/useReputationOracle'
import { ethers } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Users, 
  Award, 
  Coins, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Zap,
  Crown,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  UserCheck,
  Gavel,
  DollarSign
} from 'lucide-react'

const CONTRACT_OWNER_ADDRESS = '0xfF01A2491F19A0342f6B6b490D9ffDE0320306A1'.toLowerCase()

export default function MintSBTAdminPanel() {
  const { address, isConnected } = useAccount()
  const { mintSBT } = useSoulboundToken()
  const { signMessageAsync } = useSignMessage()
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [mintingId, setMintingId] = useState<string | null>(null)
  const { claimReward, slashVerifier, getVerifierStake } = useReputationOracle()
  const [verificationsMap, setVerificationsMap] = useState<Record<string, any[]>>({})
  const [stakes, setStakes] = useState<Record<string, bigint>>({})
  const [balances, setBalances] = useState<Record<string, bigint>>({})
  const [daoFeeBps, setDaoFeeBps] = useState<number>(500)
  const { getContributionBalance, getDaoFeeBps } = useReputationOracle()
  const [verifiers, setVerifiers] = useState<any[]>([])
  const [mintingVerifier, setMintingVerifier] = useState<string | null>(null)

  const isOwner = isConnected && address?.toLowerCase() === CONTRACT_OWNER_ADDRESS

  // Fetch eligible verifiers for SBT
  async function fetchVerifiers() {
    const { data: users } = await supabase.from('users').select('id, wallet, display_name, ens')
    if (!users) return setVerifiers([])
    const { data: verifications } = await supabase.from('verifications').select('verifier_id')
    const { data: soulbounds } = await supabase.from('soulbounds').select('user_id, reason')
    const counts: Record<string, number> = {}
    for (const v of verifications || []) {
      counts[v.verifier_id] = (counts[v.verifier_id] || 0) + 1
    }
    const eligible = users.filter(u => {
      const hasVerifierSBT = (soulbounds || []).some(
        sbt => sbt.user_id === u.id && sbt.reason && sbt.reason.toLowerCase().includes('verifier')
      )
      return counts[u.id] >= 5 && !hasVerifierSBT
    }).map(u => ({
      ...u,
      verificationsGiven: counts[u.id] || 0
    }))
    setVerifiers(eligible)
  }

  useEffect(() => {
    if (!isOwner) return
    fetchVerifiers()
  }, [isOwner])

  // Fetch pending contributions
  useEffect(() => {
    if (!isOwner) return
    setLoading(true)
    setError(null)
    async function fetchPending() {
      const { data: contribs, error: cErr } = await supabase
        .from('contributions')
        .select('*, user:user_id(id, wallet, display_name, ens)')
        .eq('status', 'pending')
      if (cErr || !contribs) {
        setPending([])
        setError('Failed to fetch contributions.')
        setLoading(false)
        return
      }
      const ids = contribs.map((c: any) => c.id)
      const { data: verifications } = await supabase
        .from('verifications')
        .select('id, contribution_id')
        .in('contribution_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000'])
      setPending(
        contribs.map((c: any) => ({
          ...c,
          verificationCount: (verifications || []).filter(v => v.contribution_id === c.id).length
        }))
      )
      setLoading(false)
    }
    fetchPending()
  }, [isOwner])

  // Fetch verifications for each contribution
  useEffect(() => {
    if (!isOwner) return
    async function fetchVerifications() {
      const { data: verifications } = await supabase
        .from('verifications')
        .select('contribution_id, verifier_id, verifier:verifier_id(wallet)')
      const map: Record<string, any[]> = {}
      if (verifications) {
        for (const v of verifications) {
          if (!map[v.contribution_id]) map[v.contribution_id] = []
          map[v.contribution_id].push(v)
        }
      }
      setVerificationsMap(map)
    }
    fetchVerifications()
  }, [isOwner, pending])

  // Fetch stakes for each verifier/contribution
  async function fetchStakes() {
    const newStakes: Record<string, bigint> = {}
    for (const contrib of pending) {
      for (const v of verificationsMap[contrib.id] || []) {
        const key = `${contrib.id}_${v.verifier?.wallet || v.verifier_id}`
        newStakes[key] = await getVerifierStake(contrib.id, v.verifier?.wallet || v.verifier_id)
      }
    }
    setStakes(newStakes)
  }

  useEffect(() => {
    fetchStakes()
  }, [pending, verificationsMap])

  // Fetch AVAX balances and DAO fee
  useEffect(() => {
    async function fetchBalancesAndFee() {
      const fee = await getDaoFeeBps()
      setDaoFeeBps(Number(fee))
      const newBalances: Record<string, bigint> = {}
      for (const contrib of pending) {
        newBalances[contrib.id] = await getContributionBalance(contrib.id)
      }
      setBalances(newBalances)
    }
    fetchBalancesAndFee()
  }, [pending])

  // Mint SBT for a verifier
  async function handleMintVerifierSBT(verifier: any) {
    setMintingVerifier(verifier.id)
    setError(null)
    setSuccess(null)
    try {
      const wallet = verifier.wallet
      if (!wallet) {
        setError('No wallet address found for verifier.')
        setMintingVerifier(null)
        return
      }
      const reason = 'Verifier SBT: Awarded for 5+ verifications'
      const tokenURI = '' // Optionally add metadata URI
      const txHash = await mintSBT(wallet, 'Verifier SBT', reason, tokenURI)
      await supabase.from('soulbounds').insert({
        user_id: verifier.id,
        dao: 'Verifier SBT',
        reason,
        minted_on: new Date().toISOString(),
        sbt_tx_hash: txHash,
        signature: '',
        contribution_id: null
      })
      setSuccess(`Verifier SBT minted for ${wallet}!`)
      await fetchVerifiers()
    } catch (err: any) {
      setError('Failed to mint Verifier SBT or update DB.')
    }
    setMintingVerifier(null)
  }

  // Mint SBT for a contribution
  async function handleMint(contribution: any) {
    setMintingId(contribution.id)
    setError(null)
    setSuccess(null)
    try {
      const wallet = contribution.user?.wallet
      if (!wallet) {
        setError('No wallet address found for user.')
        setMintingId(null)
        return
      }
      const tokenURI = '' // Optionally add metadata URI
      const txHash = await mintSBT(
        wallet,
        contribution.dao,
        contribution.reason || 'DAO Contribution',
        tokenURI
      )
      const message = `Minted SBT for ${wallet} in ${contribution.dao} for: ${contribution.reason}`
      let signature = ''
      try {
        signature = await signMessageAsync({ message })
      } catch {}
      await supabase
        .from('contributions')
        .update({ status: 'approved' })
        .eq('id', contribution.id)
      await supabase.from('soulbounds').insert({
        user_id: contribution.user_id,
        dao: contribution.dao,
        reason: contribution.reason,
        minted_on: new Date().toISOString(),
        sbt_tx_hash: txHash,
        signature,
        contribution_id: contribution.id
      })
      await claimReward(contribution.id, contribution.user.wallet)
      setSuccess(`SBT minted for ${wallet}!`)
      setPending(pending.filter((c) => c.id !== contribution.id))
    } catch (err: any) {
      setError('Failed to mint SBT or update DB.')
    }
    setMintingId(null)
  }

  async function handleSlash(contributionId: string, verifierWallet: string) {
    try {
      await slashVerifier(contributionId, verifierWallet)
      alert('Verifier slashed successfully!')
      // Refresh verifications and stakes
      const fetchVerifications = async () => {
        const { data: verifications } = await supabase
          .from('verifications')
          .select('contribution_id, verifier_id, verifier:verifier_id(wallet)')
        const map: Record<string, any[]> = {}
        if (verifications) {
          for (const v of verifications) {
            if (!map[v.contribution_id]) map[v.contribution_id] = []
            map[v.contribution_id].push(v)
          }
        }
        setVerificationsMap(map)
      }
      await fetchVerifications()
      await fetchStakes()
    } catch (e) {
      alert('Slashing failed: ' + (e as Error).message)
    }
  }

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-red-500/20 rounded-2xl p-12 text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Access Denied</h2>
          <p className="text-text-secondary">Connect with the contract owner wallet to access the admin panel.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Crown className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Admin Panel</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            SBT Mint{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
                        Manage Soulbound Token minting for verified contributions and eligible verifiers
          </p>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <div className="font-semibold text-green-400">Success!</div>
                  <div className="text-sm text-green-300/80">{success}</div>
                </div>
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <div>
                  <div className="font-semibold text-red-400">Error</div>
                  <div className="text-sm text-red-300/80">{error}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Eligible Verifiers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-purple-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-text-primary">Eligible Verifiers for SBT</h2>
            <div className="ml-auto bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
              {verifiers.length} eligible
            </div>
          </div>

          {verifiers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Eligible Verifiers</h3>
              <p className="text-text-secondary">No verifiers currently meet the criteria for SBT minting</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiers.map((v, index) => (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                      <Award className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-text-primary truncate">
                        {v.display_name || v.ens || v.wallet.slice(0, 6) + '...' + v.wallet.slice(-4)}
                      </div>
                      <div className="text-xs text-text-secondary font-mono truncate">{v.wallet}</div>
                    </div>
                  </div>

                  <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-secondary">Verifications</span>
                      <span className="font-bold text-green-400">{v.verificationsGiven}</span>
                    </div>
                  </div>

                  <button
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={!!mintingVerifier}
                    onClick={() => handleMintVerifierSBT(v)}
                  >
                    {mintingVerifier === v.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Minting...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Mint Verifier SBT
                      </>
                    )}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Pending Contributions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-text-primary">Pending Contributions</h2>
              <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                {pending.filter(c => c.verificationCount >= 3).length} ready to mint
              </div>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 flex items-center justify-center transition-all duration-200 hover:bg-slate-800/60"
            >
              <RefreshCw className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                    <div className="h-8 bg-slate-700/50 rounded w-24"></div>
                  </div>
                  <div className="h-3 bg-slate-700/30 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-700/30 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : pending.filter(c => c.verificationCount >= 3).length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-text-secondary" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary mb-2">No Contributions Ready</h3>
              <p className="text-text-secondary">No contributions have enough verifications to mint SBTs</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pending.filter(c => c.verificationCount >= 3).map((contribution, index) => {
                const totalAvax = balances[contribution.id] || BigInt(0)
                const daoFee = (totalAvax * BigInt(daoFeeBps)) / BigInt(10000)
                const payout = totalAvax - daoFee

                return (
                  <motion.div
                    key={contribution.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-6 hover:border-slate-600/30 transition-all duration-300"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 flex items-center justify-center">
                          <Award className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">{contribution.dao}</div>
                          <div className="text-sm text-text-secondary">
                            {contribution.user?.display_name || contribution.user?.ens || contribution.user?.wallet.slice(0, 6) + '...' + contribution.user?.wallet.slice(-4)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                          {contribution.verificationCount} verifications
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <p className="text-text-secondary text-sm mb-3 line-clamp-2">{contribution.reason}</p>
                      
                      <div className="text-xs text-text-secondary font-mono mb-3">
                        <span className="font-medium">User Wallet:</span> {contribution.user?.wallet}
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary flex items-center gap-2">
                            <Coins className="w-4 h-4" />
                            Total Staked
                          </span>
                          <span className="font-bold text-yellow-400">{ethers.formatEther(totalAvax)} AVAX</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            DAO Fee
                          </span>
                          <span className="font-bold text-orange-400">{ethers.formatEther(daoFee)} AVAX</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text-secondary flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" />
                            Contributor Reward
                          </span>
                          <span className="font-bold text-green-400">{ethers.formatEther(payout)} AVAX</span>
                        </div>
                      </div>
                    </div>

                    {/* Verifiers */}
                    <div className="mb-4">
                      <div className="text-sm font-medium text-text-primary mb-2">Verifiers:</div>
                      <div className="flex flex-wrap gap-2">
                        {(verificationsMap[contribution.id] || []).map((v) => (
                          <div key={v.verifier_id} className="flex items-center gap-2 bg-slate-700/30 border border-slate-600/30 rounded-lg px-3 py-2">
                            <span className="text-xs text-text-secondary font-mono">
                              {v.verifier?.wallet?.slice(0, 6) + '...' + v.verifier?.wallet?.slice(-4) || v.verifier_id.slice(0, 8) + '...'}
                            </span>
                            <button
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 px-2 py-1 rounded text-xs transition-all duration-200 disabled:opacity-50 flex items-center gap-1"
                              disabled={stakes[`${contribution.id}_${v.verifier?.wallet || v.verifier_id}`] === BigInt(0)}
                              onClick={() => handleSlash(contribution.id, v.verifier?.wallet || v.verifier_id)}
                            >
                              <Gavel className="w-3 h-3" />
                              Slash
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                                        {/* Action Button */}
                    <button
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      onClick={() => handleMint(contribution)}
                      disabled={!!mintingId}
                    >
                      {mintingId === contribution.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Minting SBT...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Mint SBT & Distribute Rewards
                        </>
                      )}
                    </button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
        >
          {[
            { 
              icon: Clock, 
              label: 'Pending Contributions', 
              value: pending.length.toString(), 
              color: 'text-yellow-400',
              bgColor: 'bg-yellow-500/20',
              borderColor: 'border-yellow-500/30'
            },
            { 
              icon: CheckCircle, 
              label: 'Ready to Mint', 
              value: pending.filter(c => c.verificationCount >= 3).length.toString(), 
              color: 'text-green-400',
              bgColor: 'bg-green-500/20',
              borderColor: 'border-green-500/30'
            },
            { 
              icon: UserCheck, 
              label: 'Eligible Verifiers', 
              value: verifiers.length.toString(), 
              color: 'text-purple-400',
              bgColor: 'bg-purple-500/20',
              borderColor: 'border-purple-500/30'
            },
            { 
              icon: DollarSign, 
              label: 'DAO Fee Rate', 
              value: `${daoFeeBps / 100}%`, 
              color: 'text-blue-400',
              bgColor: 'bg-blue-500/20',
              borderColor: 'border-blue-500/30'
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-slate-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-8 h-8 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-sm text-text-secondary uppercase tracking-wider">{stat.label}</div>
              </div>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Info Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-6 mt-8"
        >
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-primary mt-0.5" />
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Admin Panel Guidelines</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-text-secondary">Contributions need 3+ verifications to mint</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-text-secondary">Verifiers need 5+ verifications for SBT eligibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-text-secondary">Slashing removes verifier stakes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-text-secondary">SBT minting triggers reward distribution</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-text-secondary">DAO fees are automatically calculated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                    <span className="text-text-secondary">All transactions are recorded on-chain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
