// Contract address: 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac
// Run with npx ts-node --files ./scripts/GiveRightToVote.ts <ContractAddress> <VoterAddress> 
// npx ts-node --files ./scripts/GiveRightToVote.ts 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac 0x8Eae2C481788D1F28382DbD340B8a78AAadb5BE1  

import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";
const callerPrivateKey = process.env.PRIVATE_KEY || "";

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

  // Check for voter
  const address = parameters[1] as `0x${string}`;
  if (!address) throw new Error("Voter address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(address))
    throw new Error("Invalid voter address");

  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });

  // Create caller
  const caller = createWalletClient({
    account : privateKeyToAccount(`0x${callerPrivateKey}`),
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
   
  // Give `voter` the right to vote
  console.log("Giving write to vote for: " + address );
  const hash = await caller.writeContract({
    address: contractAddress,
    abi,
    functionName: "giveRightToVote",
    args: [address],
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
