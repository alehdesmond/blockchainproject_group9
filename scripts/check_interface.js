require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const contract = await hre.ethers.getContractAt("G9Token", process.env.G9TOKEN_ADDRESS);
  
  try {
    // Check if function exists
    console.log("⏳ Checking contract interface...");
    const count = await contract.mintProposalCount().catch(() => "NOT_FOUND");
    const proposal = await contract.mintProposals(0).catch(() => "NOT_FOUND");
    
    console.log("\n🔍 Interface Report:");
    console.log("mintProposalCount():", count !== "NOT_FOUND" ? "✅ Exists" : "❌ Missing");
    console.log("mintProposals(0):", proposal !== "NOT_FOUND" ? "✅ Exists" : "❌ Missing");
    
    if (count !== "NOT_FOUND") {
      console.log("\nCurrent proposal count:", Number(count));
    }
  } catch (err) {
    console.error("Diagnostic failed:", err.message);
  }
}

main();