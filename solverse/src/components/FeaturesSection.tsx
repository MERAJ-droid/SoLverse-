'use client'
import { motion } from 'framer-motion'
import { Shield, Users, Coins, AlertTriangle, Trophy, Award, ChevronRight, Zap } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Users,
      title: "Peer Verification with AVAX Staking",
      description: "Contributions are peer-reviewed by community members who stake AVAX to verify the authenticity of each submission.",
      highlight: "Trustless validation with economic incentives",
      stats: { label: "Avg Stake", value: "50 AVAX" }
    },
    {
      icon: Shield,
      title: "Soulbound Tokens (SBTs)",
      description: "Earn non-transferable SBTs as proof of your contributions or verification activity. Represent your on-chain reputation.",
      highlight: "Permanent proof of Web3 contributions",
      stats: { label: "SBTs Issued", value: "1,247" }
    },
    {
      icon: Coins,
      title: "DAO Fee & Reward Distribution",
      description: "When certified, staked AVAX is automatically split between contributor rewards and DAO treasury fees.",
      highlight: "Automated incentive alignment",
      stats: { label: "Distributed", value: "45.2K AVAX" }
    },
    {
      icon: AlertTriangle,
      title: "Slashing for Malicious Actors",
      description: "Admins can slash staked AVAX of verifiers who act maliciously or approve fraudulent contributions.",
      highlight: "Protocol integrity through economic penalties",
      stats: { label: "Slashed", value: "0.3%" }
    },
    {
      icon: Trophy,
      title: "Badge Gamification & Leaderboard",
      description: "Climb the ranks by earning badges for verification activity. Leaderboard showcases top contributors and verifiers.",
      highlight: "Competitive community recognition",
      stats: { label: "Active Users", value: "892" }
    },
    {
      icon: Award,
      title: "Certificates/DNFTs for Achievements",
      description: "Receive unique, collectible NFTs as certificates for outstanding contributions or milestones.",
      highlight: "Lasting proof of exceptional achievements",
      stats: { label: "Certificates", value: "156" }
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-900/30 to-background overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-1/4 w-64 h-64 bg-primary/2 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-blue-500/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-text-secondary">Core Features</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Decentralized{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Reputation Protocol
            </span>
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            Built on economic incentives, peer verification, and transparent governance to ensure authentic Web3 contributions
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative"
            >
              {/* Main Card */}
              <div className="h-full bg-slate-900/20 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-slate-600/30 hover:bg-slate-900/30 transition-all duration-300">
                {/* Icon & Stats Row */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center group-hover:border-primary/20 transition-colors duration-300">
                    <feature.icon className="w-6 h-6 text-text-primary group-hover:text-primary transition-colors duration-300" />
                  </div>
                  
                  {/* Stats Badge */}
                  <div className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/20 rounded-lg px-3 py-1.5">
                    <div className="text-xs text-text-secondary/60 mb-0.5">{feature.stats.label}</div>
                    <div className="text-sm font-mono font-semibold text-text-primary">{feature.stats.value}</div>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  
                  <p className="text-sm text-text-secondary/80 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Highlight Box */}
                  <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-xs text-primary/90 font-medium leading-relaxed">
                        {feature.highlight}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Arrow */}
                <div className="flex justify-end mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight className="w-4 h-4 text-primary/60" />
                </div>

                {/* Subtle Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>

              {/* Floating Accent */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
              {/* Left */}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-semibold text-text-primary mb-2">
                  Ready to Build?
                </h3>
                <p className="text-sm text-text-secondary">
                  Join the decentralized reputation revolution
                </p>
              </div>

              {/* Center - Stats */}
              <div className="flex justify-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary font-mono">99.7%</div>
                  <div className="text-xs text-text-secondary">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary font-mono">0.1s</div>
                  <div className="text-xs text-text-secondary">Avg Response</div>
                </div>
              </div>

              {/* Right */}
              <div className="text-center md:text-right">
                <button className="group bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto md:ml-auto">
                  <span>Explore Protocol</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
