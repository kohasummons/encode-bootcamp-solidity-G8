// Run with:
// npx hardhat run ./scripts/01.DeployMyTokenWithHardhat.ts --network sepolia

import { viem } from "hardhat";
import { formatEther } from "viem";

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

  // Deploy
  const ballotContract = await viem.deployContract("MyToken"); 
  console.log("Ballot contract deployed to:", ballotContract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1; 
});