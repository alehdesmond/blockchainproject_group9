require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const tokenAddress = process.env.G9TOKEN_ADDRESS;
  const G9Token = await hre.ethers.getContractAt("G9Token", tokenAddress);

  console.log("📨 Proposing mint...");
  console.log("🔑 Proposer:", signer.address);

  const recipient = "0xc3b1109Cb52c951Ee02a77D58BA797B4419E5694";
  const amount = hre.ethers.parseEther("100");

  try {
    const tx = await G9Token.proposeMint(recipient, amount);
    console.log("⏳ Waiting for confirmation...");
    const receipt = await tx.wait();

    // Look specifically for MintProposed event
    const eventTopic = hre.ethers.id("MintProposed(address,address,uint256,bytes32)");
    const proposalEvent = receipt.logs.find(log => log.topics[0] === eventTopic);

    if (!proposalEvent) {
      throw new Error("No mint proposal event found in receipt");
    }

    const decoded = G9Token.interface.parseLog(proposalEvent);
    const proposalId = decoded.args.proposalId;

    fs.writeFileSync("proposal.json", JSON.stringify({
      proposalId,
      recipient,
      amount: amount.toString()
    }));

    console.log("✅ Proposal created!");
    console.log("🔗 Proposal ID:", proposalId);
    console.log("📜 Transaction Hash:", tx.hash);
  } catch (err) {
    console.error("❌ Error:", err.message);
    if (err.receipt) {
      console.log("ℹ️ Transaction was mined but reverted");
    }
    process.exit(1);
  }
}

main();