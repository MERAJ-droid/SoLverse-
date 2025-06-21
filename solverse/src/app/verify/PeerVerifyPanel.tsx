'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useReputationOracle } from '@/lib/useReputationOracle'
import { useAccount, useSignMessage } from 'wagmi'
import { parseEther } from 'ethers'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  CheckCircle, 
  Wallet, 
  Clock, 
  ExternalLink, 
  Coins,
  AlertCircle,
  RefreshCw,
  Award,
  Zap
} from 'lucide-react'

export default function PeerVerifyPanel() {
  const { address, isConnected } = useAccount()
  const [pending, setPending] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)
  const { signMessageAsync } = useSignMessage()
  const { submitVerification } = useReputationOracle()

  // Fetch pending verifications (no signature yet)
    useEffect(() => {
    async function fetchPending() {
      setLoading(true)
      const { data } = await supabase
        .from('verifications')
        .select('*')
        .is('signature', null)
        .order('date', { ascending: false })
      setPending(data || [])
      setLoading(false)
    }
    fetchPending()
  }, [])

  async function handleVerify(v: any) {
    setError(null)
    setSuccess(null)
    setVerifyingId(v.id)
    
    if (!isConnected || !address) {
        setError('Connect your wallet to verify.')
        setVerifyingId(null)
        return
    }
    
    try {
        // 1. Fetch the verifier's UUID from the users table
        const { data: verifier, error: verifierError } = await supabase
          .from('users')
          .select('id')
          .eq('wallet', address)
          .single()

        if (verifierError || !verifier) {
          setError('Verifier not found in database.')
          setVerifyingId(null)
          return
        }

        // 2. Fetch the subject's wallet address
        const { data: subjectUser, error: subjectError } = await supabase
          .from('users')
          .select('wallet')
          .eq('id', v.user_id)
          .single()

        if (subjectError || !subjectUser) {
          setError('Subject user not found in database.')
          setVerifyingId(null)
          return
        }

        const subjectWallet = subjectUser.wallet

        const message = `I verify the contribution for DAO: ${v.dao}\nReason: ${v.reason}\nProof: ${v.proof || ''}\nBy: ${v.user_id}`
        // 3. On-chain verification
        await submitVerification(
          subjectWallet,
          v.reason || v.proof || 'DAO contribution',
          v.contribution_id, // Pass the UUID from Supabase
          { value: parseEther('0.01') }
        )
        // 4. Off-chain signature (optional, keep if you want)
        const signature = await signMessageAsync({ message })
        // 5. Update the verification with signature and verifier's UUID
        const { error: dbError } = await supabase
          .from('verifications')
          .update({ signature, verifier_id: verifier.id })
          .eq('id', v.id)
        if (dbError) throw dbError

        // 6. Insert into soulbounds table for admin minting
        await supabase.from('soulbounds').insert({
          user_id: v.user_id, // UUID of the user being verified
          dao: v.dao,
          reason: v.reason || v.proof || 'DAO contribution',
          sbt_tx_hash: null, // Not minted yet
          // minted_on: null (optional)
        })

        setSuccess('Verification signed, submitted on-chain, and soulbound entry created!')
        setPending(pending.filter(item => item.id !== v.id))
    } catch (err: any) {
        setError('Signature or on-chain verification failed.')
    }
    setVerifyingId(null)
  }

  const refreshPending = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('verifications')
      .select('*')
      .is('signature', null)
      .order('date', { ascending: false })
    setPending(data || [])
    setLoading(false)
  }

  return (
    <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <h2 className="text-xl font-heading font-bold text-text-primary">Peer Verification Panel</h2>
        </div>
        
        <button
          onClick={refreshPending}
          className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 flex items-center justify-center transition-all duration-200 hover:bg-slate-800/60"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 text-text-secondary ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected ? (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-orange-400" />
            <div>
              <div className="font-semibold text-orange-400">Wallet Required</div>
              <div className="text-sm text-orange-300/80">Connect your wallet to verify contributions</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <div className="font-semibold text-green-400">Ready to Verify</div>
              <div className="text-sm text-green-300/80">Each verification requires 0.01 AVAX</div>
            </div>
          </div>
        </div>
      )}

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
                <div className="font-semibold text-green-400">Verification Successful!</div>
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
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <div className="font-semibold text-red-400">Verification Failed</div>
                <div className="text-sm text-red-300/80">{error}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Verifications */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-slate-700/50 rounded w-32"></div>
                <div className="h-8 bg-slate-700/50 rounded w-20"></div>
              </div>
              <div className="h-3 bg-slate-700/30 rounded w-full mb-2"></div>
              <div className="h-3 bg-slate-700/30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : pending.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Pending Verifications</h3>
          <p className="text-text-secondary">All contributions have been verified by the community</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {pending.map((v, index) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                    <Award className="w-3 h-3 text-primary" />
                  </div>
                  <span className="font-semibold text-text-primary">{v.dao}</span>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-text-secondary">
                  <Clock className="w-3 h-3" />
                  <span>Pending</span>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <p className="text-text-secondary text-sm mb-2 line-clamp-2">{v.reason}</p>
                <div className="text-xs text-text-secondary">
                  <span className="font-medium">Contributor:</span> {v.user_id.slice(0, 8)}...{v.user_id.slice(-8)}
                </div>
              </div>

              {/* Verification Cost */}
              <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <Coins className="w-4 h-4" />
                    <span>Verification Cost</span>
                  </div>
                  <div className="font-semibold text-yellow-400">0.01 AVAX</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                className="w-full bg-primary hover:bg-primary-dark text-black font-semibold px-4 py-3 rounded-lg transition-all duration-200 hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                onClick={() => handleVerify(v)}
                disabled={verifyingId === v.id || !isConnected}
              >
                {verifyingId === v.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Verify & Sign
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <div className="font-semibold text-blue-400 mb-2">Verification Rewards</div>
            <ul className="text-sm text-blue-300/80 space-y-1">
              <li>• Earn reputation points for each verification</li>
              <li>• Build trust score in the community</li>
              <li>• Unlock verifier badges and privileges</li>
              <li>• Help maintain network quality and integrity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

