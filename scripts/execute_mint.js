require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const tokenAddress = process.env.G9TOKEN_ADDRESS;
  const G9Token = await hre.ethers.getContractAt("G9Token", tokenAddress);

  console.log("🔑 Executing from signer:", signer.address);

  try {
    // Load proposal data
    const { proposalId } = JSON.parse(fs.readFileSync("proposal.json", "utf8"));
    if (!proposalId) throw new Error("No proposalId found in proposal.json");
    
    console.log("🚀 Executing mint for proposal:", proposalId);

    // Check proposal status first
    const [recipient, amount, approvals, executed] = await G9Token.getProposalStatus(proposalId);
    console.log(`ℹ️ Proposal Status:
      Recipient: ${recipient}
      Amount: ${hre.ethers.formatEther(amount)} G9TK
      Approvals: ${approvals}/2
      Executed: ${executed}`);

    if (executed) throw new Error("Proposal already executed");
    if (approvals < 2) throw new Error(`Insufficient approvals (${approvals}/2)`);

    // Execute with sufficient gas
    const tx = await G9Token.executeMint(proposalId, {
      gasLimit: 200000
    });
    
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    if (receipt.status === 1) {
      console.log("✅ Mint executed successfully!");
      console.log("🔗 Tx Hash:", tx.hash);
    } else {
      throw new Error("Transaction failed");
    }
  } catch (err) {
    console.error("❌ Execution failed:", err.message);
    
    // Specific error checks
    if (err.message.includes("Invalid proposal ID")) {
      console.log("💡 Hint: The proposal may have expired or been cleared");
    } else if (err.message.includes("Insufficient approvals")) {
      console.log("💡 Hint: Need another signer to run approve_mint.js");
    } else if (err.message.includes("already executed")) {
      console.log("💡 Hint: This proposal was already processed");
    }
    
    process.exit(1);
  }
}

main();