import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { SOULBOUND_TOKEN_ADDRESS } from './contracts'
import { SoulboundTokenABI } from './SoulboundTokenABI'

export function useSoulboundToken() {
  // No need for wagmi hooks here since admin mints from their wallet

  async function getContract() {
    if (typeof window === 'undefined' || !window.ethereum) throw new Error('No wallet extension found')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(SOULBOUND_TOKEN_ADDRESS, SoulboundTokenABI, signer)
  }

  async function mintSBT(to: string, dao: string, reason: string, tokenURI: string) {
    console.log('mintSBT called with:', { to, dao, reason, tokenURI })
    const contract = await getContract()
    console.log('Contract instance:', contract)
    try {
      const tx = await contract.mint(to, dao, reason, tokenURI)
      await tx.wait()
      return tx.hash
    } catch (err: any) {
      console.error('Contract call failed:', err)
      throw err
    }
  }

  return { mintSBT }
}