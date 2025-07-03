# University of Bamenda Blockchain Credential System

A decentralized system for issuing and verifying academic credentials using:
- ERC20 token (G9Token) for payments
- Smart contract credential storage (UBaEducationCredentialsStore)
- Multi-signature governance

## 📋 Project Requirements
1. **ERC20 Token Development**
   - Multi-signature minting control (3 signers)
   - ETH-to-token conversion
   - Withdrawal with 2/3 approvals

2. **Credentials Verification System**
   - Store credential hashes on-chain
   - Pay with G9Token for verification
   - Admin-controlled operations

## 🛠 Setup

### Prerequisites
- Node.js v18+
- Hardhat
- MetaMask (Sepolia testnet)

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @openzeppelin/contracts dotenv
configuration
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/9BD26a70dD3F521b49028dEEa342A5CaDf874
PRIVATE_KEY=
ETHERSCAN_API_KEY=.

Deploy Contracts
bash
npx hardhat run scripts/deploy_G9Token.js --network sepolia
npx hardhat run scripts/deploy_credentials.js --network sepolia

Token Operations

bash
# 1. Propose mint (Signer 1)
npx hardhat run scripts/propose_mint.js --network sepolia

# 2. Approve mint (Signer 2 & 3)
npx hardhat run scripts/approve_mint.js --network sepolia

# 3. Execute mint
npx hardhat run scripts/execute_mint.js --network sepolia

 Credential Verification

bash
# 1. Store credential hash (Admin)
npx hardhat run scripts/store_credentials.js --network sepolia

# 2. Approve token payment (Student)
npx hardhat run scripts/approve_tokens.js --network sepolia

# 3. Verify credential
npx hardhat run scripts/verify_credentials.js --network sepolia

npx hardhat test test/G9Token.test.js       # Basic ERC20 + Multi-sig
npx hardhat test test/G9TokenReentrancy.test.js # Security
<<<<<<< HEAD
npx hardhat test test/UBaEducationCredentialsStore.test.js # Credential logic
=======
npx hardhat test test/UBaEducationCredentialsStore.test.js # Credential logic
>>>>>>> cd9f06f0101c89582c3510d6e6e05b2c4b837e74
