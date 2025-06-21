import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { REPUTATION_ORACLE_ADDRESS } from './contracts'
import { ReputationOracleABI } from './ReputationOracleABI'

export function useReputationOracle() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  async function getContract() {
    if (!walletClient) throw new Error('No wallet client')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(REPUTATION_ORACLE_ADDRESS, ReputationOracleABI, signer)
  }


  // For read-only trust score, use a public provider (no wallet needed)
  async function getTrustScore(user: string) {
    const provider = new ethers.JsonRpcProvider('https://avalanche-fuji-c-chain-rpc.publicnode.com')
    const contract = new ethers.Contract(REPUTATION_ORACLE_ADDRESS, ReputationOracleABI, provider)
    return await contract.getTrustScore(user)
  }

  async function submitVerification(subject: string, reason: string, contributionId: string, overrides?: any) {
    const contract = await getContract()
    const tx = await contract.submitVerification(subject, reason, contributionId, overrides || {})
    await tx.wait()
    return tx.hash
  }

  async function claimReward(contributionId: string, contributor: string) {
    const contract = await getContract()
    const tx = await contract.claimReward(contributionId, contributor)
    await tx.wait()
    return tx.hash
  }

  async function slashVerifier(contributionId: string, verifier: string) {
    const contract = await getContract()
    const tx = await contract.slashVerifier(contributionId, verifier)
    await tx.wait()
    return tx.hash
  }

  async function getVerifierStake(contributionId: string, verifier: string) {
    const provider = new ethers.JsonRpcProvider('https://avalanche-fuji-c-chain-rpc.publicnode.com')
    const contract = new ethers.Contract(REPUTATION_ORACLE_ADDRESS, ReputationOracleABI, provider)
    return await contract.verifierStakes(contributionId, verifier)
  }

  async function getContributionBalance(contributionId: string) {
    const provider = new ethers.JsonRpcProvider('https://avalanche-fuji-c-chain-rpc.publicnode.com')
    const contract = new ethers.Contract(REPUTATION_ORACLE_ADDRESS, ReputationOracleABI, provider)
    return await contract.contributionBalances(contributionId)
  }

  async function getDaoFeeBps() {
    const provider = new ethers.JsonRpcProvider('https://avalanche-fuji-c-chain-rpc.publicnode.com')
    const contract = new ethers.Contract(REPUTATION_ORACLE_ADDRESS, ReputationOracleABI, provider)
    return await contract.daoFeeBps()
  }

  return { submitVerification, getTrustScore, claimReward, slashVerifier, getVerifierStake, getContributionBalance, getDaoFeeBps }
}