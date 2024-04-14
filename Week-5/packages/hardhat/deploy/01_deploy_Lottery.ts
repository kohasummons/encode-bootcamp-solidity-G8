import { viem } from "hardhat";
import { parseEther, formatEther, Address } from "viem";
import * as readline from "readline";

const MAXUINT256 = 115792089237316195423570985008687907853269984665640564039457584007913129639935n;

let contractAddress: Address;
let tokenAddress: Address;

const BET_PRICE = "1";
const BET_FEE = "0.2";
const TOKEN_RATIO = 1n;

async function main() {
  await initContracts();
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  mainMenu(rl);
}

async function getAccounts() {
  return await viem.getWalletClients();
}

async function getClient() {
  return await viem.getPublicClient();
}

async function initContracts() {
  const contract = await viem.deployContract("Lottery", [
    "LotteryToken",
    "LT0",
    TOKEN_RATIO,
    parseEther(BET_PRICE),
    parseEther(BET_FEE),
  ]);
  contractAddress = contract.address;
  tokenAddress = await contract.read.paymentToken();
}

async function mainMenu(rl: readline.Interface) {
  menuOptions(rl);
}

function menuOptions(rl: readline.Interface) {
  rl.question(
    "Select operation: \n Options: \n [0]: Exit \n [1]: Check state \n [2]: Open bets \n [3]: Top up account tokens \n [4]: Bet with account \n [5]: Close bets \n [6]: Check player prize \n [7]: Withdraw \n [8]: Burn tokens \n",
    async (answer: string) => {
      console.log(`Selected: ${answer}\n`);
      const option = Number(answer);
      switch (option) {
        case 0:
          rl.close();
          return;
        case 1:
          await checkState();
          mainMenu(rl);
          break;
        case 2:
          rl.question("Input duration (in seconds)\n", async duration => {
            try {
              await openBets(duration);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 3:
          rl.question("What account (index) to use?\n", async index => {
            await displayBalance(index);
            rl.question("Buy how many tokens?\n", async amount => {
              try {
                await buyTokens(index, amount);
                await displayBalance(index);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 4:
          rl.question("What account (index) to use?\n", async index => {
            await displayTokenBalance(index);
            rl.question("Bet how many times?\n", async amount => {
              try {
                await bet(index, amount);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        case 5:
          try {
            await closeLottery();
          } catch (error) {
            console.log("error\n");
            console.log({ error });
          }
          mainMenu(rl);
          break;
        case 6:
          rl.question("What account (index) to use?\n", async index => {
            const prize = await displayPrize(index);
            if (Number(prize) > 0) {
              rl.question("Do you want to claim your prize? [Y/N]\n", async answer => {
                if (answer.toLowerCase() === "y") {
                  try {
                    await claimPrize(index, prize);
                  } catch (error) {
                    console.log("error\n");
                    console.log({ error });
                  }
                }
                mainMenu(rl);
              });
            } else {
              mainMenu(rl);
            }
          });
          break;
        case 7:
          await displayTokenBalance("0");
          await displayOwnerPool();
          rl.question("Withdraw how many tokens?\n", async amount => {
            try {
              await withdrawTokens(amount);
            } catch (error) {
              console.log("error\n");
              console.log({ error });
            }
            mainMenu(rl);
          });
          break;
        case 8:
          rl.question("What account (index) to use?\n", async index => {
            await displayTokenBalance(index);
            rl.question("Burn how many tokens?\n", async amount => {
              try {
                await burnTokens(index, amount);
                await displayBalance(index);
                await displayTokenBalance(index);
              } catch (error) {
                console.log("error\n");
                console.log({ error });
              }
              mainMenu(rl);
            });
          });
          break;
        default:
          throw new Error("Invalid option");
      }
    },
  );
}

async function checkState() {
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const state = await contract.read.betsOpen();
  console.log(`The lottery is ${state ? "open" : "closed"}\n`);
  if (!state) return;
  const publicClient = await getClient();
  const currentBlock = await publicClient.getBlock();
  const timestamp = Number(currentBlock?.timestamp) ?? 0;
  const currentBlockDate = new Date(timestamp * 1000);
  const closingTime = await contract.read.betsClosingTime();
  const closingTimeDate = new Date(Number(closingTime) * 1000);
  console.log(
    `The last block was mined at ${currentBlockDate.toLocaleDateString()} : ${currentBlockDate.toLocaleTimeString()}\n`,
  );
  console.log(
    `lottery should close at ${closingTimeDate.toLocaleDateString()} : ${closingTimeDate.toLocaleTimeString()}\n`,
  );
}

async function openBets(duration: string) {
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const publicClient = await getClient();
  const currentBlock = await publicClient.getBlock();
  const timestamp = currentBlock?.timestamp ?? 0;
  const tx = await contract.write.openBets([timestamp + BigInt(duration)]);
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Bets opened (${receipt?.transactionHash})`);
}

async function displayBalance(index: string) {
  const publicClient = await getClient();
  const accounts = await getAccounts();
  const balanceBN = await publicClient.getBalance({
    address: accounts[Number(index)].account.address,
  });
  const balance = formatEther(balanceBN);
  console.log(`The account of address ${accounts[Number(index)].account.address} has ${balance} ETH\n`);
}

async function buyTokens(index: string, amount: string) {
  const accounts = await getAccounts();
  const publicClient = await getClient();
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const tx = await contract.write.purchaseTokens({
    value: parseEther(amount) / TOKEN_RATIO,
    account: accounts[Number(index)].account,
  });
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Tokens bought (${receipt?.transactionHash})\n`);
}

async function displayTokenBalance(index: string) {
  const accounts = await getAccounts();
  const token = await viem.getContractAt("LotteryToken", tokenAddress);
  const balanceBN = await token.read.balanceOf([accounts[Number(index)].account.address]);
  const balance = formatEther(balanceBN);
  console.log(`The account of address ${accounts[Number(index)].account.address} has ${balance} LT0\n`);
}

async function bet(index: string, amount: string) {
  const accounts = await getAccounts();
  const publicClient = await getClient();
  const token = await viem.getContractAt("LotteryToken", tokenAddress);
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const allowTx = await token.write.approve([contractAddress, MAXUINT256], {
    account: accounts[Number(index)].account,
  });
  await publicClient.getTransactionReceipt({ hash: allowTx });
  const tx = await contract.write.betMany([BigInt(amount)], {
    account: accounts[Number(index)].account,
  });
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Bets placed (${receipt?.transactionHash})\n`);
}

async function closeLottery() {
  const publicClient = await getClient();
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const tx = await contract.write.closeLottery();
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Bets closed (${receipt?.transactionHash})\n`);
}

async function displayPrize(index: string): Promise<string> {
  const accounts = await getAccounts();
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const prizeBN = await contract.read.prize([accounts[Number(index)].account.address]);
  const prize = formatEther(prizeBN);
  console.log(
    `The account of address ${accounts[Number(index)].account.address} has earned a prize of ${prize} Tokens\n`,
  );
  return prize;
}

async function claimPrize(index: string, amount: string) {
  const accounts = await getAccounts();
  const publicClient = await getClient();
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const tx = await contract.write.prizeWithdraw([parseEther(amount)], {
    account: accounts[Number(index)].account,
  });
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Prize claimed (${receipt?.transactionHash})\n`);
}

async function displayOwnerPool() {
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const balanceBN = await contract.read.ownerPool();
  const balance = formatEther(balanceBN);
  console.log(`The owner pool has (${balance}) Tokens \n`);
}

async function withdrawTokens(amount: string) {
  const publicClient = await getClient();
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const tx = await contract.write.ownerWithdraw([parseEther(amount)]);
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Withdraw confirmed (${receipt?.transactionHash})\n`);
}

async function burnTokens(index: string, amount: string) {
  const accounts = await getAccounts();
  const publicClient = await getClient();
  const token = await viem.getContractAt("LotteryToken", tokenAddress);
  const contract = await viem.getContractAt("Lottery", contractAddress);
  const allowTx = await token.write.approve([contractAddress, MAXUINT256], {
    account: accounts[Number(index)].account,
  });
  const receiptAllow = await publicClient.getTransactionReceipt({
    hash: allowTx,
  });
  console.log(`Allowance confirmed (${receiptAllow?.transactionHash})\n`);
  const tx = await contract.write.returnTokens([parseEther(amount)], {
    account: accounts[Number(index)].account,
  });
  const receipt = await publicClient.getTransactionReceipt({ hash: tx });
  console.log(`Burn confirmed (${receipt?.transactionHash})\n`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
