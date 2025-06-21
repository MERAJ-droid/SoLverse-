'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wallet, CheckCircle, Clock, ExternalLink, Users, Award, ChevronDown, ChevronUp } from 'lucide-react'

type Verification = {
  id: string
  user_id: string
  verifier_id: string
  signature: string
  dao: string | null
  date: string
  reason: string
  verifier: {
    wallet: string
    display_name: string | null
    ens: string | null
  }
  contribution?: {
    dao: string | null
    reason: string
    proof?: string
  }
}

type Props = {
  userId: string
}

export default function VerificationHistory({ userId }: Props) {
  const [received, setReceived] = useState<Verification[]>([])
  const [given, setGiven] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'received' | 'given'>('received')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())

  useEffect(() => {
  async function fetchHistory() {
    setLoading(true)
    if (!userId) {
      setReceived([])
      setGiven([])
      setLoading(false)
      return
    }
    // Fetch verifications received (with contribution details)
    const { data: receivedRows } = await supabase
      .from('verifications')
      .select('*, contribution:contribution_id(dao, reason, proof), verifier:verifier_id(wallet, display_name, ens)')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    // Fetch verifications given (with contribution details)
    const { data: givenRows } = await supabase
      .from('verifications')
      .select('*, contribution:contribution_id(dao, reason, proof), verifier:user_id(wallet, display_name, ens)')
      .eq('verifier_id', userId)
      .order('date', { ascending: false })

    setReceived(receivedRows || [])
    setGiven(givenRows || [])
    setLoading(false)
  }
  fetchHistory()
}, [userId])

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards)
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId)
    } else {
      newExpanded.add(cardId)
    }
    setExpandedCards(newExpanded)
  }

  const renderVerificationCard = (v: Verification, type: 'received' | 'given') => {
    const isExpanded = expandedCards.has(v.id)
    
    return (
      <motion.div
        key={v.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl hover:border-slate-600/30 transition-all duration-300"
      >
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {v.verifier?.ens ? (
                <img
                  src={`https://metadata.ens.domains/mainnet/avatar/${v.verifier.ens}`}
                  alt={v.verifier.ens}
                  className="w-8 h-8 rounded-full border border-slate-600/30"
                  onError={e => (e.currentTarget.style.display = 'none')}
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-slate-600/30 overflow-hidden">
                  <Jazzicon diameter={32} seed={jsNumberForAddress(v.verifier?.wallet || '')} />
                </div>
              )}
              
              <div className="flex-1">
                <Link
                  href={`/profile/${v.verifier?.wallet}`}
                  className="font-semibold text-text-primary hover:text-primary transition-colors duration-200 text-sm"
                >
                  {v.verifier?.display_name || v.verifier?.ens || (v.verifier?.wallet?.slice(0, 6) + '...' + v.verifier?.wallet?.slice(-4))}
                </Link>
                <div className="text-xs text-text-secondary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(v.date).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-green-400" />
              </div>
              <button
                onClick={() => toggleCardExpansion(v.id)}
                className="w-6 h-6 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 flex items-center justify-center transition-all duration-200"
              >
                {isExpanded ? (
                  <ChevronUp className="w-3 h-3 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-text-secondary" />
                )}
              </button>
            </div>
          </div>

          {/* DAO Badge */}
          {v.contribution?.dao && (
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-2 py-1 mb-3">
              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              <span className="text-xs font-medium text-primary">{v.contribution.dao}</span>
            </div>
          )}

          {/* Content Preview */}
          <div className="text-sm text-text-primary mb-2 line-clamp-2">
            {v.contribution?.reason || v.reason}
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-slate-700/20 space-y-3"
            >
              {v.contribution?.proof && (
                <div>
                  <div className="text-xs text-text-secondary mb-1">Proof:</div>
                  <a 
                    href={v.contribution.proof} 
                    className="text-primary hover:text-primary-dark transition-colors duration-200 text-xs break-all flex items-center gap-1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    {v.contribution.proof}
                  </a>
                </div>
              )}
              
              <div className="text-xs text-text-secondary">
                <span className="font-medium">Verification Type:</span> {type === 'received' ? 'Received' : 'Given'}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mt-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-4">
          <Wallet className="w-3 h-3 text-primary" />
          <span className="text-xs font-medium text-primary">Verification History</span>
        </div>
        <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
          Web3 Reputation{' '}
          <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Timeline
          </span>
        </h2>
        <p className="text-text-secondary">Track your verification journey and community contributions</p>
      </motion.div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-slate-700/50 rounded-full"></div>
                                <div className="flex-1">
                  <div className="h-4 bg-slate-700/50 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-slate-700/30 rounded w-24"></div>
                </div>
              </div>
              <div className="h-3 bg-slate-700/30 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-700/30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tab Navigation */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'received'
                    ? 'bg-primary text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-800/40'
                }`}
              >
                <Award className="w-4 h-4" />
                Received ({received.length})
              </button>
              <button
                onClick={() => setActiveTab('given')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'given'
                    ? 'bg-primary text-black'
                    : 'text-text-secondary hover:text-text-primary hover:bg-slate-800/40'
                }`}
              >
                <Users className="w-4 h-4" />
                Given ({given.length})
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'received' ? (
              received.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No verifications received</h3>
                  <p className="text-text-secondary">Start contributing to earn community verifications</p>
                </motion.div>
              ) : (
                received.map(v => renderVerificationCard(v, 'received'))
              )
            ) : (
              given.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">No verifications given</h3>
                  <p className="text-text-secondary">Help others by verifying their contributions</p>
                </motion.div>
              ) : (
                given.map(v => renderVerificationCard(v, 'given'))
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}

