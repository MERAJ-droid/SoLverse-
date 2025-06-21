'use client'
import { useEffect, useState } from 'react'
import { useUser } from '@civic/auth/react'
import { useAccount } from 'wagmi'
import { supabase } from '@/lib/supabaseClient'
import ProfileEditForm from '@/components/profile/ProfileEditForm'
import SBTModal from '../SBTModal'
import { ethers } from 'ethers'
import { CONTENT_NFT_ADDRESS } from '@/lib/contracts'
import { ContentNFTABI } from '@/lib/ContentNFTABI'
import { useReputationOracle } from '@/lib/useReputationOracle'
import VerificationHistory from './VerificationHistory'
import { motion } from 'framer-motion'
import { 
  User, 
  Wallet, 
  Award, 
  FileText, 
  TrendingUp, 
  Shield, 
  Coins, 
  Calendar,
  ExternalLink,
  Edit3,
  Copy,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'

export default function ProfileClient({ wallet }: { wallet: string }) {
  const { user } = useUser()
  const { address } = useAccount()
  const [profile, setProfile] = useState<any>(null)
  const [sbts, setSbts] = useState<any[]>([])
  const [content, setContent] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSbt, setSelectedSbt] = useState<any>(null)
  const [certificates, setCertificates] = useState<any[]>([])
  const [trustScore, setTrustScore] = useState<number | null>(null)
  const [contributions, setContributions] = useState<any[]>([])
  const [balances, setBalances] = useState<Record<string, bigint>>({})
  const [daoFeeBps, setDaoFeeBps] = useState<number>(500)
  const [copied, setCopied] = useState(false)
  const { getContributionBalance, getDaoFeeBps, getTrustScore } = useReputationOracle()
  const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))

  useEffect(() => {
    async function fetchCertificates() {
      try {
        if (!wallet) return
        let checksumWallet = wallet
        try {
          checksumWallet = ethers.getAddress(wallet)
          console.log('[Profile] Fetching trust score for:', checksumWallet)
          const score = await Promise.race([
            getTrustScore(checksumWallet),
            timeout(5000)
          ])
          const verificationsGiven = profile?.verificationsGiven || 0
          setTrustScore(Number(score) / 10)
        } catch (e) {
          console.error('Trust score fetch error:', e)
          setTrustScore(null)
        }
        const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc')
        const contract = new ethers.Contract(CONTENT_NFT_ADDRESS, ContentNFTABI, provider)
        const balance = await contract.balanceOf(checksumWallet)
        console.log('[Profile] NFT balance:', balance.toString())
        const certs = []
        for (let i = 0; i < balance; i++) {
          let tokenId, tokenURI, metadata
          try {
            tokenId = await contract.tokenOfOwnerByIndex(checksumWallet, i)
            tokenURI = await contract.tokenURI(tokenId)
            console.log(`[Profile] tokenId: ${tokenId.toString()}, tokenURI: ${tokenURI}`)
            let url = tokenURI
            if (url.startsWith('ipfs://')) {
              url = url.replace('ipfs://', 'https://ipfs.io/ipfs/')
            }
            const res = await fetch(url)
            metadata = await res.json()
          } catch (e) {
            console.error(`[Profile] Error fetching metadata for tokenId ${tokenId}:`, e)
            metadata = { name: 'Unknown', description: '', image: '' }
          }
          certs.push({
            tokenId: tokenId ? tokenId.toString() : `unknown-${i}`,
            tokenURI: tokenURI || '',
            ...metadata,
          })
        }
        setCertificates(certs)
      } catch (err) {
        console.error('[Profile] fetchCertificates error:', err)
        setCertificates([])
      }
    }
    fetchCertificates()
  }, [wallet, getTrustScore])

  // Fetch profile and related data
  async function fetchProfile() {
    setLoading(true)
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('wallet', wallet)
      .single()

    let verificationsGiven = 0
    try {
      const { count } = await supabase
        .from('verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verifier_id', userData.id)
      verificationsGiven = count || 0
    } catch (e) {
      verificationsGiven = 0
    }
    setProfile({ ...userData, verificationsGiven })


    if (userData) {
      const { data: sbtData } = await supabase
        .from('soulbounds')
        .select('*')
        .eq('user_id', userData.id)
        .order('minted_on', { ascending: false })
      setSbts(sbtData || [])

      const { data: contentData } = await supabase
        .from('content')
        .select('*')
        .eq('user_id', userData.id)
        .order('timestamp', { ascending: false })
      setContent(contentData || [])

      const { data: contribData } = await supabase
        .from('contributions')
        .select('*, soulbound:soulbounds(id)')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })
      setContributions(contribData || [])

      try {
        const checksumWallet = ethers.getAddress(userData.wallet)
        const score = await getTrustScore(checksumWallet)
        setTrustScore(Number(score) / 10)
      } catch (e) {
        console.error('Trust score fetch error:', e)
        setTrustScore(null)
      }
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet])

  useEffect(() => {
    async function fetchBalancesAndFee() {
      const fee = await getDaoFeeBps()
      setDaoFeeBps(Number(fee))
      const newBalances: Record<string, bigint> = {}
      for (const c of contributions) {
        newBalances[c.id] = await getContributionBalance(c.id)
      }
      setBalances(newBalances)
    }
    if (contributions.length > 0) {
      fetchBalancesAndFee()
    }
  }, [contributions, getContributionBalance, getDaoFeeBps])

  // Determine if the logged-in user can edit this profile
  const canEdit =
    (address && address.toLowerCase() === wallet.toLowerCase())

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(wallet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <span className="text-text-primary">Loading profile...</span>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8 text-center max-w-md"
          >
            <div className="w-16 h-16 rounded-2xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-text-secondary" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">Profile Not Found</h2>
            <p className="text-text-secondary">No user found for this wallet address.</p>
          </motion.div>
        </div>
      </main>
    )
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
        {[...Array(12)].map((_, i) => (
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
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-blue-500/20 border border-primary/30 flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-primary" />
              </div>
              
              {canEdit && (
                <button className="w-full bg-slate-800/40 border border-slate-700/30 hover:border-slate-600/50 text-text-primary px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2">
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-4">
              {/* Name & Trust Score */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <h1 className="text-3xl font-heading font-bold text-text-primary">
                  {profile.display_name || profile.ens || profile.wallet.slice(0, 6) + '...' + profile.wallet.slice(-4)}
                </h1>
                
                <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-semibold">
                    Trust Score: {trustScore !== null ? trustScore : '...'}
                  </span>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="flex items-center gap-3 bg-slate-800/30 border border-slate-700/20 rounded-lg p-3">
                <Wallet className="w-4 h-4 text-text-secondary" />
                <span className="font-mono text-sm text-text-secondary flex-1 break-all">
                  {profile.wallet}
                </span>
                <button
                  onClick={copyToClipboard}
                  className="w-8 h-8 rounded-lg bg-slate-700/40 border border-slate-600/30 hover:border-slate-500/50 flex items-center justify-center transition-all duration-200"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-text-secondary" />
                  )}
                </button>
              </div>

              {/* ENS & Bio */}
              {profile.ens && (
                <div className="flex items-center gap-2 text-primary">
                  <span className="text-sm font-medium">ENS:</span>
                  <span className="font-mono text-sm">{profile.ens}</span>
                </div>
              )}
              
              {profile.bio && (
                <p className="text-text-secondary leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Edit Form */}
          {canEdit && (
            <div className="mt-8 pt-8 border-t border-slate-700/20">
              <ProfileEditForm user={profile} onUpdated={fetchProfile} />
            </div>
          )}
        </motion.div>

        {/* Verifier Badge Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Verifier Badge Progress</h3>
          </div>
          
          <div className="text-text-secondary">
            {profile.verificationsGiven < 5 && `${5 - profile.verificationsGiven} more verifications to earn "Rising Peer"`}
            {profile.verificationsGiven >= 5 && profile.verificationsGiven < 20 && `${20 - profile.verificationsGiven} more to "Active Peer"`}
            {profile.verificationsGiven >= 20 && profile.verificationsGiven < 50 && `${50 - profile.verificationsGiven} more to "Top Verifier"`}
            {profile.verificationsGiven >= 50 && `You are a Top Verifier!`}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: Shield, label: 'SBTs Earned', value: sbts.length.toString(), color: 'text-blue-400' },
            { icon: FileText, label: 'Certificates', value: certificates.length.toString(), color: 'text-green-400' },
            { icon: Zap, label: 'Contributions', value: contributions.length.toString(), color: 'text-yellow-400' },
            { icon: TrendingUp, label: 'Trust Score', value: trustScore?.toString() || '0', color: 'text-purple-400' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-slate-800/40 border border-slate-700/30 flex items-center justify-center">
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <div className="text-xs text-text-secondary uppercase tracking-wider">{stat.label}</div>
              </div>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* SBTs Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Shield className="w-4 h-4 text-blue-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-text-primary">Soulbound Tokens</h2>
            </div>

            <div className="space-y-4">
              {sbts && sbts.length > 0 ? sbts.map(sbt => (
                <div
                  key={sbt.id}
                  className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 cursor-pointer hover:border-slate-600/30 transition-all duration-300 group"
                  onClick={() => setSelectedSbt(sbt)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{sbt.dao}</span>
                      <span className="bg-primary/20 text-primary text-xs rounded-full px-2 py-0.5 border border-primary/30">SBT</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors duration-200" />
                  </div>
                  <div className="text-text-secondary text-sm line-clamp-2 mb-2" title={sbt.reason}>{sbt.reason}</div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Calendar className="w-3 h-3" />
                    <span>Minted: {new Date(sbt.minted_on).toLocaleString()}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p className="text-text-secondary">No SBTs minted yet.</p>
                </div>
              )}
            </div>

            {/* SBT Benefits */}
            <div className="mt-6 pt-6 border-t border-slate-700/20">
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-400" />
                  What does a Soulbound Token (SBT) unlock?
                </h4>
                <ul className="text-sm text-text-secondary space-y-1">
                  <li>• Bypass KYC for platform features</li>
                  <li>• Voting rights in the DAO</li>
                  <li>• Access to exclusive bounties and events</li>
                  <li>• Proof of contribution or trusted verifier status</li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Certificates Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-green-400" />
              </div>
              <h2 className="text-xl font-heading font-bold text-text-primary">Certificates</h2>
            </div>

            <div className="space-y-4">
              {certificates && certificates.length > 0 ? certificates.map(cert => (
                <div key={cert.tokenId} className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300">
                  <div className="font-semibold text-text-primary mb-2">{cert.name}</div>
                  {cert.image && (
                    <img 
                      src={cert.image.replace('ipfs://', 'https://ipfs.io/ipfs/')} 
                      alt={cert.name} 
                      className="w-full h-32 object-cover rounded-lg mb-3 border border-slate-700/20" 
                    />
                  )}
                  <div className="text-text-secondary text-sm mb-3 line-clamp-3">{cert.description}</div>
                  <a
                    href={cert.tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors duration-200 text-sm font-medium"
                  >
                    <span>View Metadata</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-text-secondary" />
                  </div>
                  <p className="text-text-secondary">No certificates yet.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Contributions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="bg-slate-900/30 backdrop-blur-xl border border-slate-700/20 rounded-2 xl p-6 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
              <Zap className="w-4 h-4 text-yellow-400" />
            </div>
            <h2 className="text-xl font-heading font-bold text-text-primary">Contributions</h2>
          </div>

          <div className="space-y-4">
            {contributions.length > 0 ? contributions.map(c => {
              const totalAvax = balances[c.id] || BigInt(0)
              const daoFee = (totalAvax * BigInt(daoFeeBps)) / BigInt(10000)
              const payout = totalAvax - daoFee
              
              return (
                <div key={c.id} className="bg-slate-800/30 border border-slate-700/20 rounded-xl p-4 hover:border-slate-600/30 transition-all duration-300">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary">{c.dao}</span>
                      <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        c.status === 'approved' 
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      }`}>
                        {c.status === 'approved' ? (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Certified (SBT Minted)
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Pending
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-text-secondary text-sm mb-4">{c.reason}</div>
                  
                  <div className="bg-slate-700/20 border border-slate-600/20 rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-text-secondary mb-1">Total AVAX Staked</div>
                        <div className="font-semibold text-text-primary flex items-center gap-1">
                          <Coins className="w-3 h-3" />
                          {ethers.formatEther(totalAvax)} AVAX
                        </div>
                      </div>
                      <div>
                        <div className="text-text-secondary mb-1">DAO Fee</div>
                        <div className="font-semibold text-orange-400">
                          {ethers.formatEther(daoFee)} AVAX
                        </div>
                      </div>
                      <div>
                        <div className="text-text-secondary mb-1">Contributor Reward</div>
                        <div className="font-semibold text-green-400">
                          {ethers.formatEther(payout)} AVAX
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-xl bg-slate-800/40 border border-slate-700/30 flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-text-secondary" />
                </div>
                <p className="text-text-secondary">No contributions yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Verification History */}
        {profile && (
          <VerificationHistory userId={profile.id} />
        )}

        {/* SBT Modal */}
        <SBTModal sbt={selectedSbt} onClose={() => setSelectedSbt(null)} />
      </div>
    </main>
  )
}


