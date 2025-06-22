# 🛡️ Solverse - Decentralized Reputation Protocol for Web3 Contributors

**Solverse** is a full-stack Web3 application that enables users to build on-chain reputations through **Soulbound Tokens (SBTs)**, content NFTs, and peer verifications. Built for contributors in DAOs and Web3 communities, Solverse promotes transparency, accountability, and ownership in digital identities.

---

## 🎯 Core Features

### 🔐 Authentication (Dual Mode with Civic)
- **Civic Auth**
  - Email login with embedded wallet
  - Civic verification badge on profile
- **EVM Wallets**
  - MetaMask / WalletConnect support
- Civic Auth users can mint SBTs directly using their embedded wallets.

---

### 👤 Create & View Profiles
- Public profile includes:
  - Wallet address
  - ENS (if available)
  - Display name
  - DAO affiliations
  - Earned SBTs
  - Total reputation score
  - NFT content (blogs/resources)

---

### 📥 DAO Activity Verification
- Users submit proof of DAO contributions (e.g., GitHub PRs, Discord activity)
- DAO peers verify using wallet signatures
- Verifications are signed and stored for auditability

---

### 🔗 Mint Soulbound Tokens (SBTs)
- Verified activities can mint non-transferable SBTs on **Avalanche Fuji Testnet**
- Powered by `SoulboundToken.sol` smart contract

---

### 📝 Create Content as NFTs
- Write blog posts/resources and mint them as NFTs
- Metadata uploaded to **IPFS** via **Pinata**
- NFTs minted using `ContentNFT.sol` contract

---

### 🏆 Earn Reputation Points
- Calculated from:
  - DAO contributions
  - Verifications given/received
  - Content created
- Points stored in Supabase (`rewards` table) and displayed on dashboards

---

### 🌐 Explore Community
- Public leaderboard
- DAO-specific rankings
- Trending content NFTs

---

## 🧰 Tech Stack

### 🖥️ Frontend
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS + Shadcn UI
- **Animations:** Framer Motion
- **Icons:** Lucide-react
- **State Management:** Zustand / Jotai
- **Auth Integration:** `@civic/auth`, `wagmi`, `RainbowKit`

---

### 🔐 Authentication System
- **Civic Auth:**
  - Email/Google login
  - Embedded wallet for minting
  - Civic badge displayed on profile
- **Wallet Connect:**
  - MetaMask / WalletConnect
- **Optional:** Supabase Email Auth fallback

---

### 🧱 Backend / API
- Next.js API routes
- Supabase DB actions via serverless functions
- Smart contract interaction directly from frontend
- Pinata upload handler
- Optional JWT-based Civic session

---

### 🧩 Database & Supabase Schema

**Tables:**

| Table         | Fields                                                             |
|---------------|--------------------------------------------------------------------|
| `users`       | `id`, `wallet`, `display_name`, `ens`, `score`                    |
| `verifications` | `user_id`, `verifier_id`, `signature`, `dao`, `date`            |
| `soulbounds`  | `user_id`, `sbt_tx_hash`, `dao`, `reason`, `minted_on`            |
| `content`     | `user_id`, `title`, `ipfs_hash`, `nft_tx_hash`, `timestamp`       |
| `rewards`     | `user_id`, `points`, `type`, `source`, `created_at`               |

---

### ⛓️ Web3 / Blockchain
- **Network:** Avalanche Fuji Testnet
- **Smart Contracts:**
  - Deployed via Hardhat
  - Written in Solidity
- **Storage:** IPFS via Pinata

---

### 📄 Smart Contracts

#### 🧬 SoulboundToken.sol
- ERC721-like but non-transferable
- Function: `mint(address, string dao, string reason)`

#### 📚 ContentNFT.sol
- Mints NFT for user-generated content
- Uses IPFS CID for metadata

#### 🧠 ReputationOracle.sol
- Handles signature verification between users
- Function: `submitVerification(address subject, address verifier, string reason)`
- May be used to calculate and validate trust scores

---

### 📤 IPFS + Pinata Integration
- Content and metadata are uploaded to Pinata
- CIDs are stored in Supabase
- Used in NFT minting for blogs/resources

---

## 🎨 UI & Theme

### 🖌️ Design Style
- Web3 dark theme with:
  - Frosted glass containers
  - Glowing CTA buttons
  - Blur + neon effects
  - Clean layout with Framer animations

### 💠 Tailwind Custom Color Palette

```ts
colors: {
  primary: '#38BDF8',
  'primary-dark': '#0ea5e9',
  background: '#0f172a',
  surface: '#1e293b',
  'text-primary': '#f1f5f9',
  'text-secondary': '#94a3b8',
  border: '#334155',
  glass: 'rgba(30,41,59,0.6)',
}

📦 UI Elements
Buttons: bg-primary text-black hover:bg-primary-dark

Cards: bg-glass shadow-xl transition hover:ring-2

Wallet Badge: bg-primary text-black px-4 py-1 rounded-full

Civic Badge: bg-[#38BDF8] text-sm rounded px-2 ml-2

🧭 Pages
Route	Description
/	Landing page
/dashboard	User overview, reputation, actions
/profile/[wallet]	Public profile page
/explore	Leaderboard, trending content
/verify	DAO contribution submission & verification
/mint	Manual minting page for SBTs and NFTs

🔐 .env Setup
env
Copy
Edit
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

PINATA_API_KEY=
PINATA_SECRET_API_KEY=

AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=

NEXT_PUBLIC_CIVIC_CLIENT_ID=
NEXT_PUBLIC_CIVIC_DASHBOARD_URL=https://auth.civic.com/dashboard