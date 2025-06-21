import axios from 'axios'

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY!
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY!

export async function uploadToPinata(metadata: any) {
  const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS'
  try {
    const res = await axios.post(url, metadata, {
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_API_KEY,
      }
    })
    return `ipfs://${res.data.IpfsHash}`
  } catch (err) {
    console.error('[uploadToPinata] Error uploading to Pinata:', err)
    throw err
  }
}