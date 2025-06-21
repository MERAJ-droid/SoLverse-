'use client'
import { motion } from 'framer-motion'
import { Shield, Vote, Star, Headphones, Trophy, Linkedin, X, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

export function SBTUtilitySection() {
  const utilities = [
    {
      icon: Shield,
      title: "Skip the KYC Hassle",
      description: "Your SBTs are your identity. No more endless verification forms or waiting periods.",
      benefit: "Instant platform access with proven on-chain reputation",
      visual: "🔐 → ✅",
      comparison: { before: "Upload documents, wait 3-7 days", after: "Connect wallet, instant access" }
    },
    {
      icon: Vote,
      title: "Real DAO Governance Power",
      description: "Your contributions matter. Vote on proposals, shape the future, and lead initiatives.",
      benefit: "Weighted voting based on your actual contributions",
      visual: "🗳️ → 🏛️",
      comparison: { before: "Token-based voting only", after: "Reputation-weighted decisions" }
    },
    {
      icon: Star,
      title: "Exclusive Opportunities",
      description: "Access high-value bounties, private hackathons, and VIP community events.",
      benefit: "Premium opportunities for proven contributors",
      visual: "🎯 → 💎",
      comparison: { before: "Public bounties only", after: "Exclusive high-reward tasks" }
    },
    {
      icon: Trophy,
      title: "Portable Web3 Resume",
      description: "Your SBTs travel with you. One reputation, infinite possibilities across DAOs.",
      benefit: "Universal proof of your Web3 contributions",
      visual: "📄 → 🌐",
      comparison: { before: "Start from zero everywhere", after: "Instant credibility anywhere" }
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-b from-background to-slate-900/40 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hook Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">SBT Utility</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-6">
            Forget LinkedIn Algorithms.{' '}
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
              Your Work Speaks On-Chain
            </span>
          </h2>
          
          <p className="text-lg text-text-secondary max-w-3xl mx-auto mb-8">
            Stop begging for endorsements and fighting algorithms. Your Soulbound Tokens are permanent, 
            verifiable proof of your Web3 contributions that unlock real utility across the ecosystem.
          </p>

          {/* Social Media Comparison */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col md:flex-row items-center justify-center gap-6 mb-12"
          >
            {/* Old Way */}
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Linkedin className="w-5 h-5 text-red-400" />
                <span className="text-sm text-red-400">Traditional</span>
              </div>
              <X className="w-4 h-4 text-red-400" />
              <span className="text-sm text-text-secondary">Beg for likes & endorsements</span>
            </div>

            <ArrowRight className="w-6 h-6 text-primary hidden md:block" />
            <div className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center md:hidden">
              <ArrowRight className="w-3 h-3 text-primary rotate-90" />
            </div>

            {/* New Way */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span className="text-sm text-green-400">SBT-Powered</span>
              </div>
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-sm text-text-secondary">Automatic credibility</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Utilities Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {utilities.map((utility, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              className="group relative"
            >
              <div className="h-full bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-primary/20 hover:bg-slate-900/40 transition-all duration-300">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                      <utility.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                        {utility.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Visual Indicator */}
                  <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                    {utility.visual}
                  </div>
                </div>

                {/* Description */}
                <p className="text-text-secondary mb-6 leading-relaxed">
                  {utility.description}
                </p>

                {/* Benefit Highlight */}
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-primary/90 font-medium">
                      {utility.benefit}
                    </p>
                  </div>
                </div>

                {/* Before/After Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                    <div className="text-xs text-red-400/80 mb-1">Before SBTs</div>
                    <div className="text-sm text-text-secondary">{utility.comparison.before}</div>
                  </div>
                  <div className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                    <div className="text-xs text-green-400/80 mb-1">With SBTs</div>
                    <div className="text-sm text-text-secondary">{utility.comparison.after}</div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ArrowRight className="w-4 h-4 text-primary/60" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-slate-900/40 via-slate-900/60 to-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-bold text-text-primary mb-2">
                  Ready to Build Your{' '}
                  <span className="text-primary">On-Chain Reputation?</span>
                </h3>
                <p className="text-text-secondary">
                  Join 892+ contributors already earning SBTs and building verifiable Web3 credibility
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-primary hover:bg-primary-dark text-black font-semibold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2">
                  <span>Start Contributing</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button className="group bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 hover:border-primary/30 text-text-primary font-medium px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>View SBT Gallery</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
