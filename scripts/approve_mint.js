// scripts/approve_mint.js
require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const tokenAddress = process.env.G9TOKEN_ADDRESS;

  const G9Token = await hre.ethers.getContractAt("G9Token", tokenAddress);

  console.log("🔑 Signer:", signer.address);

  // Load the proposal data from the file
  const proposalData = JSON.parse(fs.readFileSync("proposal.json", "utf8"));
  
  // Handle both legacy tx.hash and new numeric proposalId
  const proposalId = proposalData.txHash || proposalData.proposalId;

  if (!proposalId) {
    throw new Error("❌ No proposalId found. Did you run propose_mint.js?");
  }

  console.log("📝 Approving proposal:", proposalId);

  // Convert to bytes32 if needed (maintain backward compatibility)
  let proposalIdToUse;
  if (proposalId.startsWith("0x") && proposalId.length === 66) {
    // Legacy tx hash format
    proposalIdToUse = proposalId;
  } else {
    // New numeric format - convert to BigInt
    proposalIdToUse = hre.ethers.toBigInt(proposalId);
  }

  const tx = await G9Token.connect(signer).approveMint(proposalIdToUse);
  console.log("⏳ Waiting for confirmation...");
  await tx.wait();

  console.log("✅ Proposal approved!");
  console.log("🔗 Tx Hash:", tx.hash);
}

main().catch((err) => {
  console.error("❌ Error:", err.message || err);
  process.exit(1);
});