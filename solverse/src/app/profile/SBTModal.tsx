import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Calendar, Award, Zap } from 'lucide-react'

export default function SBTModal({ sbt, onClose }: { sbt: any, onClose: () => void }) {
  if (!sbt) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/30 rounded-2xl shadow-2xl max-w-lg w-full"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Soulbound Token</h2>
                <p className="text-sm text-text-secondary">Non-transferable achievement</p>
              </div>
            </div>
            <button 
              className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/60 flex items-center justify-center transition-all duration-200 text-text-secondary hover:text-text-primary"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* DAO Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-4">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-primary font-semibold text-lg">{sbt.dao}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                <div className="text-sm text-text-secondary mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Contribution
                </div>
                <p className="text-text-primary leading-relaxed">{sbt.reason}</p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                <div className="text-sm text-text-secondary mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Minted On
                </div>
                <p className="text-text-primary font-medium">
                  {sbt.minted_on ? new Date(sbt.minted_on).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4">
                <div className="text-sm text-text-secondary mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Blockchain Proof
                </div>
                <a 
                  href={`https://testnet.snowtrace.io/tx/${sbt.sbt_tx_hash}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                >
                  <span>View on Snowtrace</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-700/20">
              <div className="flex items-center justify-center gap-2 text-xs text-text-secondary">
                <Award className="w-3 h-3" />
                <span>This SBT is permanently bound to your wallet</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
