'use client'

import MintSBTAdminPanel from './MintSBTAdminPanel'
import { motion } from 'framer-motion'
import { Crown, Shield, Settings, BarChart3 } from 'lucide-react'

export default function AdminPage() {
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

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center pt-12 pb-8"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-primary/20 rounded-full px-4 py-2 mb-6">
            <Crown className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Administrative Control</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
            Admin{' '}
            <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Comprehensive control panel for managing SBT minting, verifier rewards, and protocol governance
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-7xl mx-auto px-4 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: Shield, 
                label: 'SBT Management', 
                description: 'Mint tokens for verified contributions',
                color: 'text-green-400',
                bgColor: 'bg-green-500/20',
                borderColor: 'border-green-500/30'
              },
              { 
                icon: Settings, 
                label: 'Protocol Control', 
                description: 'Manage fees and verification thresholds',
                color: 'text-blue-400',
                bgColor: 'bg-blue-500/20',
                borderColor: 'border-blue-500/30'
              },
              { 
                icon: BarChart3, 
                label: 'Analytics', 
                description: 'Monitor network activity and rewards',
                color: 'text-purple-400',
                bgColor: 'bg-purple-500/20',
                borderColor: 'border-purple-500/30'
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6 hover:border-slate-600/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-8 h-8 rounded-lg ${item.bgColor} border ${item.borderColor} flex items-center justify-center`}>
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-text-primary">{item.label}</h3>
                </div>
                <p className="text-sm text-text-secondary">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Panel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <MintSBTAdminPanel />
        </motion.div>
      </div>
    </div>
  )
}
