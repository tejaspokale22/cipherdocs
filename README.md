# cipherdocs.

> A decentralized certificate issuance and verification platform powered by blockchain, secured with advanced cryptography, and enabled with instant QR-based verification.

[![Watch Demo](https://img.shields.io/badge/Demo-Video-blue)](https://drive.google.com/file/d/1p8YxuRGFv6lTcjeTwlK3nJgG-tc432M_/view)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Demo](#demo)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
  - [For Issuers](#for-issuers)
  - [For Users](#for-users)
  - [For Verifiers](#for-verifiers)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [API Endpoints](#api-endpoints)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

## Overview

CipherDocs is a decentralized document verification system that leverages blockchain technology to issue, verify, and manage tamper-proof documents. Built on Polygon blockchain with IPFS storage, it provides cryptographic security and instant QR-based verification for certificates, diplomas, licenses, and other critical documents.

## Features

- 🔐 **Blockchain-Based Issuance** - Immutable document records on Polygon blockchain
- 📱 **QR Code Verification** - Instant authenticity checks via QR scanning
- 🔒 **IPFS Storage** - Decentralized, encrypted document storage
- ⏱️ **Lifecycle Management** - Revoke and expire certificates with smart contract controls
- 👥 **Role-Based Access** - Support for Issuers, Users, and Verifiers
- 🔍 **Transparent Audit Trail** - Complete verification history and trust scores
- 🔗 **Secure Sharing** - Share verified documents via tamper-proof links

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Styling
- **Ethers.js** - Blockchain interactions
- **SWR** - Data fetching

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **IPFS/Pinata** - Decentralized storage
- **JWT** - Authentication

### Blockchain
- **Solidity 0.8.20** - Smart contract language
- **Hardhat** - Development framework
- **Polygon Amoy** - Testnet deployment
- **Ethers.js** - Blockchain library

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  MongoDB    │
│  (Next.js)  │     │  (Express)  │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │
      │                    │
      ▼                    ▼
┌─────────────┐     ┌─────────────┐
│   Polygon   │     │     IPFS    │
│  Blockchain │     │   (Pinata)  │
└─────────────┘     └─────────────┘
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB instance (local or Atlas)
- MetaMask or compatible Web3 wallet
- Pinata account (for IPFS)
- Polygon Amoy testnet access

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cipherdocs
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../backend
   npm install
   
   # Blockchain
   cd ../blockchain
   npm install
   ```

3. **Configure environment variables**

   **Frontend** (`.env.local`):
   ```env
   NEXT_PUBLIC_CONTRACT_ADDRESS=<your-contract-address>
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

   **Backend** (`.env`):
   ```env
   PORT=5000
   MONGO_URI=<your-mongodb-connection-string>
   PINATA_JWT=<your-pinata-jwt-token>
   JWT_SECRET=<your-jwt-secret>
   CONTRACT_ADDRESS=<your-contract-address>
   PRIVATE_KEY=<deployer-private-key>
   AMOY_RPC_URL=<polygon-amoy-rpc-url>
   ```

   **Blockchain** (`.env`):
   ```env
   AMOY_RPC_URL=<polygon-amoy-rpc-url>
   PRIVATE_KEY=<deployer-private-key>
   POLYGONSCAN_API_KEY=<polygonscan-api-key>
   ```

4. **Deploy smart contract**
   ```bash
   cd blockchain
   npm run deploy:amoy
   ```
   Copy the deployed contract address to your environment variables.

5. **Start the application**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Usage

### For Issuers

1. Connect your Web3 wallet (MetaMask)
2. Register as an Issuer
3. Upload and issue documents to users
4. Manage document lifecycle (revoke/expire)

### For Users

1. Connect your Web3 wallet
2. Register as a User
3. Receive and view issued certificates
4. Share certificates via QR codes or links

### For Verifiers

1. Scan QR code or enter certificate ID
2. Verify document authenticity instantly
3. View certificate details and issuer information

## Project Structure

```
cipherdocs/
├── frontend/          # Next.js frontend application
│   ├── src/
│   │   ├── app/       # App router pages and components
│   │   └── lib/       # Utilities and contract interactions
│   └── public/        # Static assets
├── backend/           # Express.js backend API
│   ├── src/
│   │   ├── config/    # Database and service configs
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/  # IPFS, blockchain services
│   │   └── utils/     # Helper functions
│   └── server.js      # Entry point
└── blockchain/        # Smart contracts
    ├── contracts/     # Solidity contracts
    ├── scripts/       # Deployment scripts
    └── hardhat.config.js
```

## Smart Contract

The `CipherDocs` contract manages certificate issuance and verification:

- **Issue Certificate**: Record document hash and metadata on-chain
- **Revoke Certificate**: Mark certificates as revoked
- **Get Certificate**: Query certificate details by ID

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with wallet signature
- `GET /api/auth/me` - Get current user

### Certificates
- `POST /api/certificates/issue` - Issue new certificate
- `GET /api/certificates/:id` - Get certificate details
- `POST /api/certificates/:id/revoke` - Revoke certificate
- `GET /api/certificates` - List certificates

## Security

- Cryptographic hashing for document integrity
- Blockchain immutability for tamper-proof records
- JWT-based authentication
- Encrypted IPFS storage
- Smart contract access controls

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

Built with ❤️ using blockchain technology
