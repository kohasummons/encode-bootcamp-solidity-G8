// Tokenized Ballot Contract address: 0x7a9cf487143827659cae112e55f08a2f6975e058
// Run with npx ts-node --files ./scripts/04.Vote.ts <ContractAddress> <Proposal> <Ammount> 
// npx ts-node --files ./scripts/04.Vote.ts 0x7a9cf487143827659cae112e55f08a2f6975e058 0 10  

import { abi, bytecode } from "../artifacts/contracts/TokenizedBallot.sol/TokenizedBallot.json";
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

  // Check for proposal index
  const proposalToVoteFor = parameters[1] ;
  if (isNaN(Number(proposalToVoteFor))) throw new Error("Invalid proposal");

  // Check for number of voting power to be used
  const votingPower = parameters[2] ;
  if (isNaN(Number(votingPower))) throw new Error("Invalid voting power number");
  
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
   
  // Vote
  console.log("Voting for proposal " + proposalToVoteFor + " using " + votingPower + " voting power"); 
  const hash = await caller.writeContract({
    address: contractAddress,
    abi,
    functionName: "vote",
    args: [proposalToVoteFor, votingPower],
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
