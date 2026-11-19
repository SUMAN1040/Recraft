# Recraft.ai Clone (Next.js + Django + AI Engine + Solidity Web3 Security)

A full-stack recreation of **[Recraft.ai](https://www.recraft.ai/home)** — the generative AI design platform known for its infinite vector graphics canvas, multi-style synthesis, brand color palettes, raster-to-vector tracing, and on-chain digital copyright provenance.

Built for end-to-end testing, local experimentation, and production extension.

---

## 🌟 Architecture & Stack

```
Recraft/
├── frontend/             # Next.js 16 (App Router), Tailwind CSS, Lucide, Ethers.js
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Recraft.ai Landing Page Clone (Hero, Vector vs Raster slider, Styles)
│   │   │   ├── app/page.tsx      # Infinite Canvas & Studio App (Prompt dock, layers, pan/zoom)
│   │   │   └── verify/page.tsx   # Cryptographic Provenance & Authenticity Audit Portal
│   │   ├── components/           # Navbar, StylePicker, PalettePicker, VectorComparisonSlider, Web3Modal
│   │   ├── contracts/            # RecraftSecurityProvenance ABI & deployed contract configuration
│   │   └── lib/                  # api.ts (backend client), web3.ts (MetaMask & Solidity interaction)
│
├── backend/              # Django 5 + Django REST Framework + Pillow + PyCryptodome
│   ├── recraft_backend/  # Settings, URLs, CORS, Oracle credentials
│   ├── core/             # Canvas boards & element persistence (UUID, coordinates, SVG data)
│   ├── ai_engine/        # Recraft multi-style SVG vector synthesis, Image-to-Vector tracer
│   └── security_provenance/ # Keccak-256 digests, Oracle ECDSA signatures, audit records
│
├── blockchain/           # Hardhat + Solidity 0.8.24 + OpenZeppelin Contracts
│   ├── contracts/
│   │   └── RecraftSecurityProvenance.sol # ERC-721 IP Provenance, Anti-Tamper & Oracle Attestation
│   ├── scripts/deploy.js # Synchronizes ABI & address to both frontend and backend
│   └── test/             # 5 unit tests verifying signatures, nonces, and anti-forgery
│
├── docker-compose.yml    # Multi-container orchestration
├── test_all.sh           # One-step test runner for all components
├── start_backend.sh      # Launch Django backend
├── start_frontend.sh     # Launch Next.js frontend
└── start_blockchain.sh   # Launch local Hardhat Ethereum node
```

---

## 🚀 Key Features

### 1. Frontend (Next.js 16)
- **Recraft Landing Page Clone (`/`)**:
  - Hero section with live interactive generation sandbox.
  - **Vector vs Raster Interactive Zoom Slider**: Demonstrates 800% zoom comparison between crisp SVG vectors and blurry JPEG pixels.
  - Multi-style gallery (Vector Art, 3D Render, Digital Illustration, Icon Set, Photorealism, Pixel Art, Line Art).
  - Web3 security provenance showcase.
  - Pricing tiers and dark sleek aesthetic matching Recraft.ai.
- **Infinite Canvas Studio (`/app`)**:
  - Pan & Zoom canvas workspace with dot grid background.
  - Movable generated artwork artboards with live SVG rendering.
  - Recraft signature **floating prompt dock** at bottom:
    - Style selector dropdown
    - Aspect ratio selector (`1:1`, `16:9`, `9:16`, `4:3`)
    - Custom brand palette picker with preset swatches
    - Generate button with loading spinner
  - **Image-to-Vector (Vectorize)** tool: upload raster images and convert them into SVG paths.
  - Export menu (Download pure `.svg` files).
- **Security & Provenance Portal (`/verify`)**:
  - Drag-and-drop verification for AI artworks.
  - Computes Keccak-256 digest in-browser.
  - Queries smart contract on-chain to verify authorship, timestamp, model version, and tamper-proofing.

### 2. Backend (Django REST Framework)
- **AI Synthesis Engine (`/api/ai/`)**:
  - Algorithmic SVG generation with geometric paths, gradients, and brand palettes.
  - Image vectorization endpoint (`/api/ai/vectorize/`): traces raster bitmap data into scalable SVG geometry.
  - Cryptographic Keccak-256 content hashing and AI Oracle ECDSA signing.
- **Canvas Project CRUD (`/api/canvas/`)**:
  - Save, retrieve, and update infinite canvas items, coordinates, prompts, and layers.
- **Security Provenance API (`/api/security/`)**:
  - Oracle signature endpoint for Solidity minting.
  - Authenticity audit endpoint with logging.

### 3. Solidity Smart Contract (`blockchain/`)
- **`RecraftSecurityProvenance.sol`** (ERC-721 + OpenZeppelin 5.1):
  - **Cryptographic Oracle Signature Check**: Prevents unauthorized minting or prompt-theft; only artworks with valid backend signatures can be registered.
  - **Replay Attack Protection**: User nonces prevent re-using signatures.
  - **Tamper-Proof Anti-Duplication**: Prevents registering duplicate hashes.
  - **Public Verification**: `verifyProvenance(bytes32 imageHash)` and `verifyContentRaw(bytes rawContent)`.

---

## ⚡ Quick Start

### Option A: Run locally (Recommended for rapid testing)

1. **Run All Tests**:
   ```bash
   ./test_all.sh
   ```
   *Runs all 5 Solidity smart contract tests and 3 Django backend tests.*

2. **Start Backend**:
   ```bash
   ./start_backend.sh
   ```
   *Runs migrations and starts Django at `http://127.0.0.1:8000`.*

3. **Start Frontend**:
   ```bash
   ./start_frontend.sh
   ```
   *Starts Next.js dev server at `http://localhost:3000`.*

4. **(Optional) Start Local Blockchain**:
   ```bash
   ./start_blockchain.sh
   ```
   *Starts local Hardhat Ethereum node at `http://127.0.0.1:8545`.*

---

### Option B: Run with Docker Compose

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000/api`
- Hardhat Node: `http://localhost:8545`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/generate/` | Generates SVG artwork, hash, and oracle signature |
| `GET` | `/api/ai/styles/` | Returns 7 Recraft style presets & sample palettes |
| `POST` | `/api/ai/vectorize/` | Converts uploaded raster image into SVG vector code |
| `GET` | `/api/ai/jobs/<id>/` | Retrieves status and metadata of a generation job |
| `POST` | `/api/security/oracle-signature/` | Generates verified ECDSA signature for on-chain minting |
| `POST` | `/api/security/verify/` | Audits hash or uploaded file for authenticity and tampering |
| `POST` | `/api/security/record-mint/` | Records on-chain token ID and tx hash |
| `GET` | `/api/canvas/projects/` | List and create infinite canvas projects |
| `POST` | `/api/canvas/projects/<id>/elements/` | Adds artwork elements to canvas |

---

## 🔒 Security & Smart Contract Verification

To run the Hardhat test suite directly:
```bash
cd blockchain
npx hardhat test
```

Expected output:
```
  RecraftSecurityProvenance Smart Contract
    ✔ Should set the correct oracle signer and initial state
    ✔ Should successfully register and mint artwork with valid AI Oracle signature
    ✔ Should reject registration with invalid signature (e.g. forged by attacker)
    ✔ Should prevent duplicate registration of the same image hash
    ✔ Should allow raw content verification directly

  5 passing
```
