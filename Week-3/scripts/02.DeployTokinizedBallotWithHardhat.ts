// My Token contract address: 0x020615D5F5C4A12ac04EFB19c558f767cD1Bba94
// Run with:
// npx hardhat run ./scripts/02.DeployTokinizedBallotWithHardhat.ts --network sepolia

import { viem } from "hardhat";
import { toHex, formatEther } from "viem";
const PROPOSALS = ["Chocolate", "Vanilla", "Strawberry"];
const MY_TOKEN_ADDRESS = "0x020615D5F5C4A12ac04EFB19c558f767cD1Bba94"

async function main() {

  // View chain and account information before deploying 
  const publicClient = await viem.getPublicClient();
  const blockNumber = await publicClient.getBlockNumber();
  console.log("Last block number:", blockNumber);
  const [deployer] = await viem.getWalletClients();
  console.log("Deployer address:", deployer.account.address);
  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log(
    "Deployer balance:",
    formatEther(balance),
    deployer.chain.nativeCurrency.symbol
  );

  // Deploy with My Token as voting token 
  // and block 0 as voting power snapshot
  const ballotContract = await viem.deployContract("TokenizedBallot", [
    PROPOSALS.map((prop) => toHex(prop, { size: 32 })),
    MY_TOKEN_ADDRESS
    ,0]); 
  console.log("Tokenized Ballot contract deployed to:", ballotContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1; 
});