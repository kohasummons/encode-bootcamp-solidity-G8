// Contract address: 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac
// Run with npx ts-node --files ./scripts/WinningProposal.ts <address>  
// npx ts-node --files ./scripts/WinningProposal.ts 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac 

import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString, bytesToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config(); 

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

async function main() {

  // Check parameters length
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 1)
    throw new Error("Parameter not provided");

  // Check first parameter is address 
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");
 
  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
   
  // Read proposals
  console.log("Winning Proposal: ");
  const winner = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "winnerName",
    })) as any[];
    console.log(winner);
  }
 

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
