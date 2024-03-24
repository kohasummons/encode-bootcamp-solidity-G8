// Contract address: 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac
// Run with npx ts-node --files ./scripts/ReadProposals.ts <address> <numberOfProposals> 
// npx ts-node --files ./scripts/ReadProposals.ts 0xe0d0dfbedfdcdbf50fedc4a89df5214becdb5aac 3

import { abi, bytecode } from "../artifacts/contracts/Ballot.sol/Ballot.json";
import { createPublicClient, http, createWalletClient, formatEther, toHex, hexToString } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import * as dotenv from "dotenv";

dotenv.config();

const providerApiKey = process.env.ALCHEMY_API_KEY || "";

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

  // Check for porposal number
  const proposalNumber = parameters[1] ;
  console.log(proposalNumber);
  if (isNaN(Number(proposalNumber))) throw new Error("Invalid proposal index");
  
  // Create public client
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${providerApiKey}`),
  });
   
  // Read proposals
  console.log("Proposals: ");
  for (let index = 0; index <= Number(proposalNumber) - 1; index++) {
    const proposal = (await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: "proposals",
      args: [BigInt(index)],
    })) as any[];
    const name = hexToString(proposal[0], { size: 32 });
    console.log({ index, name, proposal });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
