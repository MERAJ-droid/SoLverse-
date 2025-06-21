'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAccount } from 'wagmi'
import PeerVerifyPanel from './PeerVerifyPanel'
import { motion } from 'framer-motion'
import { Footer } from '@/components/Footer'
import { 
  Send, 
  Wallet, 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Shield,
  Users,
  ExternalLink
} from 'lucide-react'

export default function VerifyPage() {
  const { address, isConnected } = useAccount()
  const [dao, setDao] = useState('')
  const [proof, setProof] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    if (!isConnected || !address) {
      setError('Connect your wallet to submit a contribution.')
      setSubmitting(false)
      return
    }

    // 1. Fetch the user's UUID from the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet', address)
      .single()

    if (userError || !user) {
      setError('User not found in database.')
      setSubmitting(false)
      return
    }

    // 2. Insert the contribution with the user's UUID
    const { error: dbError } = await supabase.from('contributions').insert({
      user_id: user.id, // UUID
      dao,
      proof,
      reason: reason || proof || 'DAO contribution',
      status: 'pending',
      created_at: new Date().toISOString(),
    })

    setSubmitting(false)
    if (dbError) {
      setError('Failed to submit contribution.')
    } else {
      setSuccess(true)
      setDao('')
      setProof('')
      setReason('')
    }
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
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Contribution Verification</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Submit DAO{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Contribution
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Share your DAO contributions and get verified by the community to earn reputation and rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submission Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Send className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-xl font-heading font-bold text-text-primary">New Contribution</h2>
            </div>

            {/* Connection Status */}
            {!isConnected ? (
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="font-semibold text-orange-400">Wallet Required</div>
                    <div className="text-sm text-orange-300/80">Connect your wallet to submit contributions</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <div className="font-semibold text-green-400">Wallet Connected</div>
                    <div className="text-sm text-green-300/80 font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</div>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* DAO Name */}
              <div>
                <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  DAO Name
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-slate-800/40 border border-slate-700/30 text-text-primary placeholder-text-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="e.g., Uniswap, Compound, Aave..."
                  value={dao}
                  onChange={e => setDao(e.target.value)}
                  required
                />
              </div>

              {/* Proof */}
              <div>
                <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Proof Link
                </label>
                <input
                  className="w-full rounded-xl px-4 py-3 bg-slate-800/40 border border-slate-700/30 text-text-primary placeholder-text-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                  placeholder="GitHub PR, Discord message, forum post..."
                  value={proof}
                  onChange={e => setProof(e.target.value)}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-text-primary font-medium mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Description
                  <span className="text-text-secondary text-sm font-normal">(Optional)</span>
                </label>
                <textarea
                  className="w-full rounded-xl px-4 py-3 bg-slate-800/40 border border-slate-700/30 text-text-primary placeholder-text-secondary focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none"
                  placeholder="Describe your contribution in detail..."
                  rows={4}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  maxLength={256}
                />
                <div className="text-xs text-text-secondary mt-1 text-right">
                  {reason.length}/256 characters
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-4 rounded-xl transition-all duration-200 hover:shadow-glow hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
                disabled={submitting || !isConnected}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Contribution
                  </>
                )}
              </button>

              {/* Status Messages */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-semibold text-green-400">Submitted Successfully!</div>
                      <div className="text-sm text-green-300/80">Your contribution is now pending verification</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="font-semibold text-red-400">Submission Failed</div>
                      <div className="text-sm text-red-300/80">{error}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </form>

            {/* Info Box */}
            <div className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-blue-400 mb-2">How it works</div>
                  <ul className="text-sm text-blue-300/80 space-y-1">
                    <li>• Submit your DAO contribution with proof</li>
                    <li>• Community members verify your work</li>
                    <li>• Earn reputation points and potential rewards</li>
                    <li>• Get Soulbound Tokens for verified contributions</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Peer Verification Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <PeerVerifyPanel />
          </motion.div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
