// Contract address: 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac
// Run with npx ts-node --files ./scripts/CastVote.ts <address> <proposalToVoteFor> 
// npx ts-node --files ./scripts/CastVote.ts 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac 3

import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const voterPrivateKey = process.env.PRIVATE_KEY || "";

async function main() {

  // Check parameters length
  const parameters = process.argv.slice(2);
  if (!parameters || parameters.length < 2)
    throw new Error("Parameters not provided");

  // Check first parameter is address 
  const contractAddress = parameters[0] as `0x${string}`;
  if (!contractAddress) throw new Error("Contract address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(contractAddress))
    throw new Error("Invalid contract address");

  // Check for proposal index
  const proposalToVoteFor = parameters[1] ;
  console.log(proposalToVoteFor);
  if (isNaN(Number(proposalToVoteFor))) throw new Error("Invalid proposal");
  
  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // Create voter
  const voter = createWalletClient({
    account : privateKeyToAccount(`0x${voterPrivateKey}`),
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
   
  // Vote for proposal and await confirmation
  console.log("Voting for proposal at index: " + proposalToVoteFor );
  const hash = await voter.writeContract({
    address: contractAddress,
    abi,
    functionName: "vote",
    args: [BigInt(proposalToVoteFor)],
  });
  console.log("Transaction hash:", hash);
  console.log("Waiting for confirmations...");
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log("Transaction confirmed");
  }

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
