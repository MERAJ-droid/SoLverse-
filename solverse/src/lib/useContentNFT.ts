import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { CONTENT_NFT_ADDRESS } from './contracts'
import { ContentNFTABI } from './ContentNFTABI'

export function useContentNFT() {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()

  async function getContract() {
    if (!walletClient) throw new Error('No wallet client')
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    return new ethers.Contract(CONTENT_NFT_ADDRESS, ContentNFTABI, signer)
  }

  async function mintContentNFT(to: string, ipfsHash: string) {
  const contract = await getContract()
  console.log('Minting on contract:', contract.address)
  const network = await contract.runner?.provider?.getNetwork?.()
  console.log('Network:', network)
  const tx = await contract.mint(to, ipfsHash)
  await tx.wait()
  return tx.hash
}

  return { mintContentNFT }
}