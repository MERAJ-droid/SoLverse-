'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabaseClient'
import { useReputationOracle } from '@/lib/useReputationOracle'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Link from 'next/link'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  TrendingUp, 
  Award, 
  Calendar, 
  ExternalLink, 
  BarChart3,
  Shield,
  Users,
  Zap,
  Eye,
  ChevronRight,
  Sparkles,
  Trophy
} from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

type SBT = {
  id: string
  dao: string
  reason: string
  minted_on: string
  sbt_tx_hash: string
  utility?: string | null
}

export default function ExplorerPage() {
  const { address } = useAccount()
  const { getTrustScore } = useReputationOracle()
  const [sbts, setSbts] = useState<SBT[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trustScore, setTrustScore] = useState<number | null>(null)
  const [avgTrustScore, setAvgTrustScore] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)

  // Fetch user, SBTs, and trust scores
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      setError(null)
      if (!address) {
        setLoading(false)
        return
      }
      // 1. Fetch user info
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('wallet', address)
        .single()
      setUser(userData)

      // 2. Fetch user's SBTs (soulbounds)
      const { data: sbtRows } = await supabase
        .from('soulbounds')
        .select('*')
        .eq('user_id', userData?.id)
        .order('minted_on', { ascending: false })
      setSbts(sbtRows || [])

      // 3. Fetch user's trust score (on-chain)
      try {
        const score = await getTrustScore(address)
        setTrustScore(Number(score))
      } catch {
        setTrustScore(null)
      }

      // 4. Fetch all users' trust scores for average
      const { data: allUsers } = await supabase
        .from('users')
        .select('wallet')
      let total = 0
      let count = 0
      if (allUsers) {
        for (const u of allUsers) {
          try {
            const s = await getTrustScore(u.wallet)
            total += Number(s)
            count++
          } catch {}
        }
      }
      setAvgTrustScore(count > 0 ? total / count : null)
      setLoading(false)
    }
    fetchData()
    // eslint-disable-next-line
  }, [address])

  // Example SBT utility mapping (could be stored in DB or metadata)
  function getUtility(sbt: SBT) {
    // You can expand this mapping or fetch from sbt.utility if stored
    if (sbt.dao === 'DAO X') return 'Skip KYC in DAO X'
    if (sbt.dao === 'DAO Y') return 'Higher grants in DAO Y'
    if (sbt.dao === 'MetaBuilders') return 'Access to MetaBuilders private Discord'
    return sbt.utility || 'Community reputation & voting power'
  }

  // Chart data
  const chartData = {
    labels: ['Your Trust Score', 'Average'],
    datasets: [
      {
        label: 'Trust Score',
        data: [trustScore ?? 0, avgTrustScore ?? 0],
        backgroundColor: ['#22c55e', '#3b82f6'],
        borderRadius: 8,
      },
    ],
  }

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
            <Search className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Reputation Analytics</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            🔍 Reputation{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Explorer
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Explore your Web3 reputation, SBTs, and community standing in the decentralized ecosystem
          </p>
        </motion.div>

        {/* Connection Status */}
        {!address ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-6">
              <Eye className="w-8 h-8 text-text-secondary" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Connect Your Wallet</h3>
            <p className="text-text-secondary">Connect your wallet to explore your reputation and view your SBTs</p>
          </motion.div>
        ) : loading ? (
          <div className="space-y-8">
            {/* Loading Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-slate-700/50 rounded-lg"></div>
                    <div className="h-4 bg-slate-700/50 rounded w-24"></div>
                  </div>
                  <div className="h-8 bg-slate-700/50 rounded w-16 mb-2"></div>
                  <div className="h-3 bg-slate-700/30 rounded w-32"></div>
                </div>
              ))}
            </div>

            {/* Loading SBTs */}
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6">
              <div className="h-6 bg-slate-700/50 rounded w-48 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-slate-700/50 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-slate-700/30 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-700/30 rounded w-24"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* User Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-600/30">
                  {user?.ens ? (
                    <img
                      src={`https://metadata.ens.domains/mainnet/avatar/${user.ens}`}
                      alt={user.ens}
                      className="w-full h-full object-cover"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  ) : (
                    <Jazzicon diameter={64} seed={jsNumberForAddress(address)} />
                  )}
                </div>
                
                <div className="flex-1">
                  <h2 className="text-2xl font-heading font-bold text-text-primary mb-1">
                    {user?.display_name || user?.ens || address.slice(0, 6) + '...' + address.slice(-4)}
                  </h2>
                  <div className="text-text-secondary text-sm font-mono mb-2">{address}</div>
                  {user?.ens && (
                    <div className="text-primary text-sm">ENS: {user.ens}</div>
                  )}
                </div>

                <Link
                  href={`/profile/${address}`}
                  className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  <span>View Profile</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                { 
                  icon: TrendingUp, 
                  label: 'Your Trust Score', 
                  value: trustScore?.toString() || '0', 
                  color: 'text-green-400',
                  bgColor: 'bg-green-500/20',
                  borderColor: 'border-green-500/30'
                },
                { 
                  icon: Users, 
                  label: 'Network Average', 
                  value: avgTrustScore !== null ? avgTrustScore.toFixed(2) : '...', 
                  color: 'text-blue-400',
                  bgColor: 'bg-blue-500/20',
                  borderColor: 'border-blue-500/30'
                },
                { 
                  icon: Shield, 
                  label: 'SBTs Earned', 
                  value: sbts.length.toString(), 
                  color: 'text-purple-400',
                  bgColor: 'bg-purple-500/20',
                  borderColor: 'border-purple-500/30'
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className={`bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-slate-600/30 transition-all duration-300`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-lg ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-sm text-text-secondary uppercase tracking-wider">{stat.label}</div>
                  </div>
                  <div className={`text-3xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                  {index === 0 && trustScore !== null && avgTrustScore !== null && (
                    <div className="text-xs text-text-secondary">
                      {trustScore > avgTrustScore ? (
                        <span className="text-green-400">↗ Above average</span>
                      ) : trustScore < avgTrustScore ? (
                        <span className="text-orange-400">↘ Below average</span>
                      ) : (
                        <span className="text-blue-400">→ At average</span>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>

            {/* Trust Score Comparison Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-blue-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-text-primary">Trust Score Comparison</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: 'rgba(15, 23, 42, 0.9)',
                          titleColor: '#f1f5f9',
                          bodyColor: '#94a3b8',
                          borderColor: '#334155',
                          borderWidth: 1,
                        }
                      },
                      scales: {
                        y: { 
                          beginAtZero: true, 
                          ticks: { 
                            stepSize: 1,
                            color: '#94a3b8'
                          },
                          grid: {
                            color: 'rgba(51, 65, 85, 0.3)'
                          }
                        },
                        x: {
                          ticks: {
                            color: '#94a3b8'
                          },
                          grid: {
                            display: false
                          }
                        }
                      },
                    }}
                    height={200}
                  />
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Your Score</span>
                      <span className="text-2xl font-bold text-green-400">{trustScore ?? 0}</span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((trustScore ?? 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary">Network Average</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {avgTrustScore !== null ? avgTrustScore.toFixed(2) : '...'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/30 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min((avgTrustScore ?? 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SBTs & Utilities Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <h2 className="text-xl font-heading font-bold text-text-primary">Your SBTs & Utilities</h2>
              </div>

              {sbts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No SBTs Yet</h3>
                  <p className="text-text-secondary mb-6">Start contributing to DAOs to earn your first Soulbound Token</p>
                  <Link
                    href="/verify"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    <Zap className="w-4 h-4" />
                    Submit Contribution
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {sbts.map((sbt, index) => (
                    <motion.div
                      key={sbt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-text-primary">{sbt.dao}</h3>
                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                              <Calendar className="w-3 h-3" />
                              <span>Minted: {new Date(sbt.minted_on).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <a
                          href={`https://testnet.snowtrace.io/tx/${sbt.sbt_tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:text-primary-dark transition-colors duration-200 text-sm opacity-0 group-hover:opacity-100"
                        >
                          <span>View Tx</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <p className="text-text-secondary text-sm mb-4 line-clamp-2">{sbt.reason}</p>

                      <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-sm font-medium text-text-primary mb-1">This SBT unlocks:</div>
                            <div className="text-sm text-text-secondary">{getUtility(sbt)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-700/20">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-secondary">Transaction Hash</span>
                          <span className="font-mono text-text-secondary">
                            {sbt.sbt_tx_hash.slice(0, 10)}...{sbt.sbt_tx_hash.slice(-6)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* SBT Benefits Info */}
              <div className="mt-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-6">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-purple-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-text-primary mb-3">SBT Utility Examples</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span className="text-text-secondary">Skip KYC processes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span className="text-text-secondary">Access exclusive events</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                          <span className="text-text-secondary">Higher grant allocations</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-text-secondary">Governance voting rights</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-text-secondary">Private community access</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          <span className="text-text-secondary">Reputation-based rewards</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-r from-primary/10 to-blue-500/10 border border-primary/20 rounded-2xl p-8 text-center"
            >
              <h3 className="text-2xl font-heading font-bold text-text-primary mb-2">
                Ready to Build Your Reputation?
              </h3>
              <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
                Start contributing to DAOs, verify others' work, and earn SBTs to unlock exclusive benefits in the Web3 ecosystem
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-glow hover:scale-105"
                >
                  <Zap className="w-4 h-4" />
                  Submit Contribution
                </Link>
                <Link
                  href="/feed"
                  className="inline-flex items-center gap-2 bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 text-text-primary font-semibold px-6 py-3 rounded-lg transition-all duration-200 hover:bg-slate-800/60"
                >
                  <Users className="w-4 h-4" />
                  Verify Others
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </main>
  )
}

