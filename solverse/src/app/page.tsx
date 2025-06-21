'use client'
import { useRouter } from 'next/navigation'
import { useUser } from '@civic/auth/react'
import { useAccount } from 'wagmi'
import { HeroSection } from '@/components/HeroSection'
import Header from '@/components/Header'
import AuthSection from '@/components/auth/AuthSection'
import { HowItWorksSection } from '@/components/HowItWorksSection'
import { FeaturesSection } from '@/components/FeaturesSection'
import { SBTUtilitySection } from '@/components/SBTUtilitySection'
import { FAQSection } from '@/components/FAQSection'
import { Footer } from '@/components/Footer'

export default function LandingPage() {
  const router = useRouter()
  const { user } = useUser()
  const { isConnected } = useAccount()
  
  // Check if user is authenticated via either Civic or wallet
  const isAuthenticated = Boolean(user) || isConnected

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header with auth buttons */}
      <Header />
      
      {/* Auth Section for profile syncing */}
      <AuthSection />
      
      {/* Hero Section */}
      <HeroSection 
        onGetStarted={handleGetStarted}
        isAuthenticated={isAuthenticated}
      />

      <HowItWorksSection />

      <FeaturesSection />

      <SBTUtilitySection />

      <FAQSection />
      <Footer /> 
    </main>
  )
}
