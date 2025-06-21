'use client'
import { motion } from 'framer-motion'
import { Plus, Minus, HelpCircle } from 'lucide-react'
import { useState } from 'react'

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: "What exactly is an SBT and why should I care?",
      answer: "A Soulbound Token (SBT) is your permanent Web3 reputation badge. Unlike regular NFTs, it can't be sold or transferred - it's tied to YOU. Think of it as your verified LinkedIn profile, but on-chain and actually trustworthy. It proves your contributions are real, not bought."
    },
    {
      question: "How do I actually earn AVAX rewards?",
      answer: "Simple: Submit proof of your DAO work (GitHub PRs, Discord contributions, etc.), get it peer-verified by community members who stake AVAX, and once certified, you automatically receive AVAX rewards. The more valuable your contribution, the higher the reward."
    },
    {
      question: "What stops people from gaming the verification system?",
      answer: "Economic incentives. Verifiers must stake their own AVAX to verify contributions. If they approve fake work, admins can slash their stake and send it to the DAO treasury. This creates real financial consequences for dishonest behavior."
    },
    {
      question: "Do I really need to go through KYC again?",
      answer: "Nope! Once you have an SBT, your on-chain reputation speaks for itself. No more uploading documents or waiting for approval - your verified contributions are your identity. This saves you time and protects your privacy."
    },
    {
      question: "How do I get started without any existing reputation?",
      answer: "Start small: Connect your wallet, browse existing contributions to understand quality standards, then submit your first piece of work or begin verifying others' contributions. Every Web3 reputation journey starts with a single verified contribution."
    }
  ]

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-900/40 to-background overflow-hidden">
      {/* Subtle Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-primary/2 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-slate-700/30 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-text-secondary">Frequently Asked</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-heading font-bold text-text-primary mb-4">
            Questions & Answers
          </h2>
          <p className="text-base text-text-secondary max-w-2xl mx-auto">
            Everything you need to know about building your Web3 reputation with Solverse
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl hover:border-slate-600/30 transition-all duration-300 overflow-hidden">
                {/* Question Button */}
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-900/20 transition-colors duration-200"
                >
                  <span className="text-base font-medium text-text-primary pr-4 leading-relaxed">
                    {faq.question}
                  </span>
                  
                  <div className="flex-shrink-0">
                    <motion.div
                      animate={{ rotate: openIndex === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-8 h-8 rounded-full bg-slate-800/40 border border-slate-700/30 flex items-center justify-center group-hover:border-primary/20 group-hover:bg-primary/5 transition-colors duration-200"
                    >
                      {openIndex === index ? (
                        <Minus className="w-4 h-4 text-primary" />
                      ) : (
                        <Plus className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors duration-200" />
                      )}
                    </motion.div>
                  </div>
                </button>

                {/* Answer */}
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-5">
                    <div className="border-t border-slate-700/20 pt-4">
                      <p className="text-sm text-text-secondary/90 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center mt-12"
        >
          <div className="bg-slate-900/20 backdrop-blur-xl border border-slate-700/20 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              Still have questions?
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              Join our community or reach out to our team for personalized support
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="bg-primary/10 hover:bg-primary/20 border border-primary/20 hover:border-primary/40 text-primary font-medium px-5 py-2.5 rounded-lg transition-all duration-200 text-sm">
                Join Discord
              </button>
              <button className="bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 hover:border-slate-600/60 text-text-primary font-medium px-5 py-2.5 rounded-lg transition-all duration-200 text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
