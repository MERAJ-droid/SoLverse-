'use client'
import { motion } from 'framer-motion'
import { Sparkles, Shield, Trophy, Users, ArrowRight, Zap } from 'lucide-react'
import { FeatureTextFlip } from '@/components/ui/container-text-flip'

interface HeroSectionProps {
  onGetStarted: () => void
  isAuthenticated: boolean
}

export function HeroSection({ onGetStarted, isAuthenticated }: HeroSectionProps) {
  const features = [
    { icon: Shield, text: 'Soulbound Tokens' },
    { icon: Users, text: 'Peer Verification' },
    { icon: Trophy, text: 'Reputation Score' },
    { icon: Zap, text: 'AVAX Rewards' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-slate-900">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 bg-glass backdrop-blur-xl border border-primary/20 rounded-full px-6 py-3 mb-12 mt-8 shadow-glass"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-text-primary">
            Decentralized Reputation Protocol
          </span>
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold text-text-primary mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
            SoL-verse
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl md:text-2xl lg:text-3xl text-text-secondary mb-4 max-w-4xl mx-auto leading-relaxed"
        >
          On-chain Reputation & Contribution for{' '}
          <span className="text-primary font-semibold">DAOs</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-lg md:text-xl text-text-secondary/80 mb-12 max-w-3xl mx-auto"
        >
          Earn trust, rewards, and badges for real DAO work. Build your Web3 reputation with Soulbound Tokens and peer verifications.
        </motion.p>

        {/* Animated Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex justify-center mb-12"
        >
          <FeatureTextFlip 
            features={features}
            interval={2500}
            className="mx-auto px-8 py-4 text-lg"
          />
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          {isAuthenticated ? (
            <button
              onClick={onGetStarted}
              className="group relative bg-primary hover:bg-primary-dark text-black font-semibold px-8 py-4 rounded-glass transition-all duration-300 hover:shadow-glow hover:scale-105 flex items-center gap-2"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-20 rounded-glass transition-opacity"></div>
            </button>
          ) : (
            <div className="text-text-secondary text-lg">
              👆 Connect your wallet or sign in above to get started
            </div>
          )}

          <button className="group bg-glass backdrop-blur-xl border border-primary/30 hover:border-primary/60 text-text-primary font-semibold px-8 py-4 rounded-glass transition-all duration-300 hover:shadow-glass hover:bg-primary/5 flex items-center gap-2">
            <span>Explore Protocol</span>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-5 h-5 text-primary" />
            </motion.div>
          </button>
        </motion.div>

        {/* Stats Preview */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-8 w-[100%] mx-auto"
        >
        {[
            {
            label: 'SBTs Minted',
            value: '1,247',
            icon: Shield,
            gradient: 'from-blue-500 to-cyan-400',
            description: 'Non-transferable tokens representing verified contributions',
            trend: '+12% this month'
            },
            {
            label: 'Contributors',
            value: '892',
            icon: Users,
            gradient: 'from-purple-500 to-pink-400',
            description: 'Active Web3 builders earning reputation across DAOs',
            trend: '+8% this week'
            },
            {
            label: 'AVAX Distributed',
            value: '45.2K',
            icon: Zap,
            gradient: 'from-yellow-500 to-orange-400',
            description: 'Total rewards distributed to verified contributors',
            trend: '+156 AVAX today'
            },
            {
            label: 'DAOs Active',
            value: '23',
            icon: Trophy,
            gradient: 'from-green-500 to-emerald-400',
            description: 'Organizations using Solverse for reputation tracking',
            trend: '+3 new this month'
            },
        ].map((stat, index) => (
            <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
                duration: 0.2,
                delay: 0.8 + (index * 0.05),
            }}
            whileHover={{
                y: -8,
                scale: 1.02,
                transition: { duration: 0.1 }
            }}
            className="group relative bg-slate-900/60 backdrop-blur-xl rounded-2xl p-5 hover:bg-slate-800/70 transition-all duration-100 cursor-pointer overflow-hidden h-[80%]"
            >
            {/* Animated Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-100`} />
            
            {/* Glowing Border Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-100" />
            <div className="absolute inset-[1px] rounded-2xl bg-slate-900/60 backdrop-blur-xl" />
            
            {/* Content */}
            <div className="relative z-10">
                {/* Icon with Glow Effect */}
                <div className="relative mb-3">
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className={`w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${stat.gradient} p-0.5 shadow-lg`}
                >
                    <div className="w-full h-full bg-slate-900/90 rounded-full flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-white" />
                    </div>
                </motion.div>
                
                {/* Pulsing Ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className={`absolute inset-0 w-12 h-12 mx-auto rounded-full bg-gradient-to-br ${stat.gradient} opacity-20`}
                />
                </div>

                {/* Value with Counter Animation */}
                <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.9 + (index * 0.05), duration: 0.15 }}
                className="text-3xl font-bold text-text-primary mb-2 font-mono text-center"
                >
                <span className="bg-gradient-to-r from-white to-text-secondary bg-clip-text text-transparent">
                    {stat.value}
                </span>
                </motion.div>

                {/* Label */}
                <div className="text-center mb-2">
                <div className="text-base font-semibold text-text-primary mb-1">
                    {stat.label}
                </div>
                <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    transition={{ delay: 1.0 + (index * 0.05), duration: 0.3 }}
                    className={`h-0.5 bg-gradient-to-r ${stat.gradient} mx-auto rounded-full`}
                />
                </div>

                {/* Description */}
                <div className="text-xs text-text-secondary/80 text-center mb-2 leading-relaxed min-h-[32px]">
                {stat.description}
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center justify-center">
                <div className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${stat.gradient} bg-opacity-10 text-text-primary border border-white/10`}>
                    {stat.trend}
                </div>
                </div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(4)].map((_, i) => (
                    <motion.div
                    key={i}
                    className={`absolute w-1 h-1 bg-gradient-to-r ${stat.gradient} rounded-full`}
                    style={{
                        left: `${15 + i * 25}%`,
                        top: `${15 + i * 20}%`,
                    }}
                    animate={{
                        y: [-8, -16, -8],
                        opacity: [0, 0.8, 0],
                        scale: [0, 1, 0],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.2 + index * 0.1,
                    }}
                    />
                ))}
                </div>

                {/* Corner Accents */}
                <div className={`absolute top-3 right-3 w-2 h-2 bg-gradient-to-br ${stat.gradient} rounded-full opacity-40 group-hover:opacity-80 transition-opacity duration-100`} />
                <div className={`absolute bottom-3 left-3 w-1.5 h-1.5 bg-gradient-to-br ${stat.gradient} rounded-full opacity-30 group-hover:opacity-60 transition-opacity duration-100`} />
            </div>

            {/* Bottom Glow */}
            <div className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 w-4/5 h-px bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-40 transition-opacity duration-100`} />
            
            {/* Side Glow */}
            <div className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-px h-3/5 bg-gradient-to-b ${stat.gradient} opacity-0 group-hover:opacity-30 transition-opacity duration-100`} />
            </motion.div>
        ))}
        </motion.div>


        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-3 bg-primary rounded-full mt-2"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
