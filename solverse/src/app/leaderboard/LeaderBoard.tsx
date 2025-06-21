'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useReputationOracle } from '@/lib/useReputationOracle'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Link from 'next/link'
import { ethers } from 'ethers'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, Crown, TrendingUp, Users, Zap, Shield, Star, ChevronRight } from 'lucide-react'

type User = {
  id: string
  wallet: string
  display_name: string | null
  ens: string | null
  bio: string | null
}

type LeaderboardUser = User & { trustScore: number; verificationsGiven: number }

function getVerifierBadge(count: number) {
  if (count >= 50) return { label: '🏅 Top Verifier', color: 'text-yellow-700' }
  if (count >= 20) return { label: '🥈 Active Peer', color: 'text-blue-700' }
  if (count >= 5) return { label: '🥉 Rising Peer', color: 'text-green-700' }
  return null
}

function getRankIcon(rank: number) {
  switch (rank) {
    case 1: return <Crown className="w-5 h-5 text-yellow-400" />
    case 2: return <Medal className="w-5 h-5 text-gray-400" />
    case 3: return <Award className="w-5 h-5 text-amber-600" />
    default: return <div className="w-5 h-5 rounded-full bg-slate-700/50 flex items-center justify-center text-xs font-bold text-text-secondary">{rank}</div>
  }
}

function getProgressToNext(count: number) {
  if (count < 5) return { next: 5, label: 'Rising Peer', progress: (count / 5) * 100 }
  if (count < 20) return { next: 20, label: 'Active Peer', progress: ((count - 5) / 15) * 100 }
  if (count < 50) return { next: 50, label: 'Top Verifier', progress: ((count - 20) / 30) * 100 }
  return { next: null, label: 'Max Level', progress: 100 }
}

export default function Leaderboard() {
  const { getTrustScore } = useReputationOracle()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true)
      // 1. Fetch all users from Supabase
      const { data: userRows, error } = await supabase
        .from('users')
        .select('*')
      if (error) {
        setUsers([])
        setLoading(false)
        return
      }
      // 2. Fetch all verifications (just verifier_id)
      const { data: verifications } = await supabase
        .from('verifications')
        .select('verifier_id')
      // 3. Count verifications given per user
      const verificationsMap: Record<string, number> = {}
      if (verifications) {
        for (const v of verifications) {
          if (!verificationsMap[v.verifier_id]) verificationsMap[v.verifier_id] = 0
          verificationsMap[v.verifier_id]++
        }
      }
      // 4. For each user, fetch trust score from Oracle and verificationsGiven
      const leaderboard: LeaderboardUser[] = await Promise.all(
        (userRows as User[]).map(async (user) => {
          let trustScore = 0
          try {
            let checksumWallet = user.wallet
            try {
              checksumWallet = ethers.getAddress(user.wallet)
            } catch {}
            trustScore = Number(await getTrustScore(checksumWallet)) / 10
          } catch {}
          const verificationsGiven = verificationsMap[user.id] || 0

          return { ...user, trustScore, verificationsGiven }
        })
      )
      // 5. Sort by trust score descending
      leaderboard.sort((a, b) => b.trustScore - a.trustScore)
      setUsers(leaderboard)
      setLoading(false)
    }
    fetchLeaderboard()
    // eslint-disable-next-line
  }, [])

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

      <div className="relative z-10 max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Trophy className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Community Rankings</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            🏆 Trust{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Top contributors ranked by their on-chain reputation and community trust
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          {[
            { icon: Users, label: 'Total Contributors', value: users.length.toString(), color: 'text-blue-400' },
            { icon: Shield, label: 'Total Trust Score', value: users.reduce((sum, u) => sum + u.trustScore, 0).toString(), color: 'text-green-400' },
            { icon: Zap, label: 'Verifications Given', value: users.reduce((sum, u) => sum + u.verificationsGiven, 0).toString(), color: 'text-yellow-400' },
            { icon: Star, label: 'Top Verifiers', value: users.filter(u => u.verificationsGiven >= 50).length.toString(), color: 'text-purple-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">{stat.label}</div>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-700/50 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-700/30 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-slate-700/30 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Leaderboard Table */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl overflow-hidden"
          >
            {/* Table Header */}
            <div className="bg-slate-800/40 border-b border-slate-700/20 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-medium text-text-secondary uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Contributor</div>
                <div className="col-span-3">Wallet</div>
                <div className="col-span-2">Trust Score</div>
                <div className="col-span-2">Badge</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-700/20">
              {users.map((u, i) => {
                const badge = getVerifierBadge(u.verificationsGiven)
                const progress = getProgressToNext(u.verificationsGiven)
                const rank = i + 1
                
                return (
                  <motion.div
                    key={u.wallet}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="group hover:bg-slate-800/20 transition-all duration-300"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center px-6 py-6">
                      {/* Rank */}
                      <div className="col-span-1">
                        <div className="flex items-center justify-center">
                          {getRankIcon(rank)}
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          {u.ens ? (
                            <img
                              src={`https://metadata.ens.domains/mainnet/avatar/${u.ens}`}
                              alt={u.ens}
                              className="w-10 h-10 rounded-full border border-slate-600/30"
                              onError={e => (e.currentTarget.style.display = 'none')}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full border border-slate-600/30 overflow-hidden">
                              <Jazzicon diameter={40} seed={jsNumberForAddress(u.wallet)} />
                            </div>
                          )}
                          
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/profile/${u.wallet}`}
                              className="font-semibold text-text-primary hover:text-primary transition-colors duration-200 flex items-center gap-2 group/link"
                            >
                              <span className="truncate">
                                {u.display_name || u.ens || u.wallet.slice(0, 6) + '...' + u.wallet.slice(-4)}
                              </span>
                              <ChevronRight className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
                            </Link>
                            {u.ens && (
                              <div className="text-xs text-text-secondary truncate">{u.ens}</div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Wallet */}
                      <div className="col-span-3">
                        <div className="font-mono text-sm text-text-secondary bg-slate-800/40 border border-slate-700/30 rounded-lg px-3 py-1.5 truncate">
                          {u.wallet.slice(0, 8)}...{u.wallet.slice(-6)}
                        </div>
                      </div>

                      {/* Trust Score */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-green-400">{u.trustScore}</div>
                          {u.trustScore > 0 && (
                            <div className="flex items-center gap-1">
                                                            <TrendingUp className="w-4 h-4 text-green-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Badge & Progress */}
                      <div className="col-span-2">
                        <div className="space-y-2">
                          {badge ? (
                            <div className="flex items-center gap-2">
                              <span className={`font-semibold text-sm ${badge.color}`}>{badge.label}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-text-secondary">No badge yet</span>
                          )}
                          
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-text-secondary">{u.verificationsGiven} verifications</span>
                              {progress.next && (
                                <span className="text-text-secondary">{progress.next - u.verificationsGiven} to {progress.label}</span>
                              )}
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="w-full bg-slate-700/30 rounded-full h-1.5 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress.progress}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={`h-full rounded-full ${
                                  progress.progress === 100 
                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                                    : 'bg-gradient-to-r from-primary to-blue-400'
                                }`}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Indicator */}
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-8 bg-gradient-to-b from-primary/50 to-transparent rounded-full"></div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && users.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">No contributors yet</h3>
            <p className="text-text-secondary mb-6">Be the first to build your Web3 reputation!</p>
            <button className="bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200">
              Start Contributing
            </button>
          </motion.div>
        )}

        {/* Badge Legend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Verifier Badge System
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { 
                badge: '🥉 Rising Peer', 
                requirement: '5+ verifications', 
                color: 'text-green-700',
                description: 'Starting to build trust in the community'
              },
              { 
                badge: '🥈 Active Peer', 
                requirement: '20+ verifications', 
                color: 'text-blue-700',
                description: 'Consistently contributing to peer reviews'
              },
              { 
                badge: '🏅 Top Verifier', 
                requirement: '50+ verifications', 
                color: 'text-yellow-700',
                description: 'Elite contributor with proven track record'
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-semibold ${item.color}`}>{item.badge}</span>
                </div>
                <div className="text-sm text-text-secondary mb-1">{item.requirement}</div>
                <div className="text-xs text-text-secondary/80">{item.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-text-primary mb-2">Want to climb the leaderboard?</h3>
            <p className="text-text-secondary mb-6">Start contributing to DAOs and verifying others' work to build your reputation</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Submit Contribution
              </button>
              <button className="bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 text-text-primary font-semibold px-6 py-3 rounded-lg transition-all duration-200 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Verify Others
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

