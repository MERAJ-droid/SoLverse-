'use client'
import { motion } from 'framer-motion'
import { Upload, Users, Award, TrendingUp, ArrowRight, CheckCircle, Zap, GitBranch, Shield, Coins } from 'lucide-react'

export function HowItWorksSection() {
  const steps = [
    {
      id: 1,
      title: "Submit Contribution",
      description: "Upload proof of your DAO work",
      icon: Upload,
      accent: "border-blue-500/30 bg-blue-500/5",
      mockupIcon: GitBranch,
      mockupData: {
        title: "Smart Contract Audit",
        status: "Submitted",
        type: "GitHub PR #247"
      }
    },
    {
      id: 2,
      title: "Get Verified",
      description: "Peers review your contribution",
      icon: Users,
      accent: "border-purple-500/30 bg-purple-500/5",
      mockupIcon: CheckCircle,
      mockupData: {
        title: "Verification Complete",
        status: "3/3 Approved",
        type: "DAO Members"
      }
    },
    {
      id: 3,
      title: "Earn Rewards",
      description: "Receive SBTs and AVAX tokens",
      icon: Award,
      accent: "border-yellow-500/30 bg-yellow-500/5",
      mockupIcon: Shield,
      mockupData: {
        title: "SBT #1247 Minted",
        status: "+125 AVAX",
        type: "Smart Contract"
      }
    },
    {
      id: 4,
      title: "Level Up",
      description: "Build your reputation score",
      icon: TrendingUp,
      accent: "border-green-500/30 bg-green-500/5",
      mockupIcon: Coins,
      mockupData: {
        title: "Reputation Updated",
        status: "Level 7 Developer",
        type: "Score: 2,847"
      }
    }
  ]

  return (
    <section className="relative py-16 bg-gradient-to-b from-background to-slate-900/30 overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary/3 rounded-full blur-2xl"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-500/3 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-full px-4 py-2 mb-6">
            <Zap className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-text-secondary">How It Works</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-3">
            Build Your{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Web3 Reputation
            </span>
          </h2>
          <p className="text-base text-text-secondary max-w-2xl mx-auto">
            Four simple steps to transform your DAO contributions into verifiable reputation
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Left - Realistic Mac Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Mac Frame */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/40 overflow-hidden">
              {/* Realistic Mac Header */}
              <div className="bg-slate-700/50 px-4 py-3 flex items-center gap-3 border-b border-slate-600/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-slate-600/40 rounded-md px-3 py-1 text-xs text-text-secondary flex items-center gap-2 min-w-0">
                    <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                    <span className="truncate">solverse.app/dashboard</span>
                  </div>
                </div>
              </div>

              {/* Content Area */}
              <div className="p-4 space-y-3 bg-slate-900/40">
                {steps.map((step, index) => (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${step.accent} backdrop-blur-sm hover:bg-slate-800/30 transition-all duration-200 cursor-pointer group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-800/60 flex items-center justify-center flex-shrink-0">
                        <step.mockupIcon className="w-4 h-4 text-text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {step.mockupData.title}
                        </div>
                        <div className="text-xs text-text-secondary flex items-center gap-2">
                          <span>{step.mockupData.status}</span>
                          <span className="w-1 h-1 bg-text-secondary/40 rounded-full"></span>
                          <span className="truncate">{step.mockupData.type}</span>
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-primary/60 rounded-full group-hover:bg-primary transition-colors"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right - Compact Step Cards */}
          <div className="lg:col-span-3 space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative"
              >
                <div className="flex items-center gap-4 p-4 bg-slate-900/30 backdrop-blur-xl rounded-xl border border-slate-700/20 hover:border-slate-600/40 transition-all duration-200 hover:bg-slate-900/40">
                  {/* Step Number */}
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{step.id}</span>
                  </div>

                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-slate-800/40 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-text-primary" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-text-primary mb-1">
                      {step.title}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-text-secondary/40 group-hover:text-primary/60 transition-colors flex-shrink-0" />
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-8 top-16 w-px h-4 bg-gradient-to-b from-primary/30 to-transparent"></div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Compact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-12"
        >
          <button className="group bg-primary/90 hover:bg-primary text-black font-medium px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 flex items-center gap-2 mx-auto text-sm">
            <span>Start Building Reputation</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  )
}
