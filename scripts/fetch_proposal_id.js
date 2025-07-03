// scripts/fetch_proposal_id.js
const hre = require("hardhat");
const fs = require("fs");
require("dotenv").config();

async function main() {
  const G9Token = await hre.ethers.getContractAt("G9Token", process.env.G9TOKEN_ADDRESS);
  const [signer] = await hre.ethers.getSigners();

  console.log("🔍 Searching for latest MintProposed event...");

  // Query only the last 500 blocks to avoid RPC limitations
  const latestBlock = await hre.ethers.provider.getBlockNumber();
  const fromBlock = Math.max(latestBlock - 500, 0);

  const events = await G9Token.queryFilter("MintProposed", fromBlock, latestBlock);

  if (events.length === 0) {
    throw new Error("❌ No MintProposed events found in the last 500 blocks");
  }

  const latestEvent = events[events.length - 1];
  const proposalId = latestEvent.args.proposalId;

  console.log("✅ Found proposalId:", proposalId);

  // Save to proposal.json
  fs.writeFileSync("proposal.json", JSON.stringify({ proposalId }, null, 2));
  console.log("📁 Saved to proposal.json");
}

main().catch((err) => {
  console.error("❌ Failed to fetch proposal:", err.message || err);
  process.exit(1);
});
