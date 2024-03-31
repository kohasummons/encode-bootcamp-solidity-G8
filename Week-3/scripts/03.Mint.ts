// My Token Contract address: 0x020615d5f5c4a12ac04efb19c558f767cd1bba94
// Run with npx ts-node --files ./scripts/03.Mint.ts <ContractAddress> <Address> <Ammount> 
// npx ts-node --files ./scripts/03.Mint.ts 0x020615d5f5c4a12ac04efb19c558f767cd1bba94 0x010c8e5e35cd0C687F49b9eF19467A2c8218F0f3 100  

import { abi, bytecode } from "../artifacts/contracts/MyToken.sol/MyToken.json";
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

  // Check for address that receives tokens
  const address = parameters[1] as `0x${string}`;
  if (!address) throw new Error("Receiver address not provided");
  if (!/^0x[a-fA-F0-9]{40}$/.test(address))
    throw new Error("Invalid receiver address");

  // Check for number of tokens to be minted
  const mintedNo = parameters[2] ;
  if (isNaN(Number(mintedNo))) throw new Error("Invalid minting number");
  
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
   
  // Mint
  console.log("Minting " + mintedNo + " MyToken for: " + address );
  const hash = await caller.writeContract({
    address: contractAddress,
    abi,
    functionName: "mint",
    args: [address, mintedNo ],
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
