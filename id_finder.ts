//William Ambrozic 2022
//Code adapted from https://solanacookbook.com/references/nfts.html#candy-machine-v1

import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import * as readline from 'readline';
import config from './config.json';

const connection = new Connection(config.data.RPC);

const MAX_NAME_LENGTH = 32;
const MAX_URI_LENGTH = 200;
const MAX_SYMBOL_LENGTH = 10;
const MAX_CREATOR_LEN = 32 + 1 + 1;
const MAX_CREATOR_LIMIT = 5;
const MAX_DATA_SIZE = 4 + MAX_NAME_LENGTH + 4 + MAX_SYMBOL_LENGTH + 4 + MAX_URI_LENGTH + 2 + 1 + 4 + MAX_CREATOR_LIMIT * MAX_CREATOR_LEN;
const MAX_METADATA_LEN = 1 + 32 + 32 + MAX_DATA_SIZE + 1 + 1 + 9 + 172;
const CREATOR_mintAddrAY_START = 1 + 32 + 32 + 4 + MAX_NAME_LENGTH + 4 + MAX_URI_LENGTH + 4 + MAX_SYMBOL_LENGTH + 2 + 1 + 4;

const TOKEN_METADATA_PROGRAM = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

const getMintAddresses = async (firstCreatorAddress: PublicKey) => {
  const metadataAccounts = await connection.getProgramAccounts(
    TOKEN_METADATA_PROGRAM,
    {
      // The mint address is located at byte 33 and lasts for 32 bytes.
      dataSlice: { offset: 33, length: 32 },

      filters: [
        // Only get Metadata accounts.
        { dataSize: MAX_METADATA_LEN },

        // Filter using the first creator.
        {
          memcmp: {
            offset: CREATOR_mintAddrAY_START,
            bytes: firstCreatorAddress.toBase58(),
          },
        },
      ],
    },
  );

  return metadataAccounts.length;
};




let rl = readline.createInterface({
input: process.stdin,
output: process.stdout
});

rl.question('Please enter a mint address: ', (answer) => {
(async () => {
  console.log("Attemping to find potential ID");

  let res = await connection.getParsedAccountInfo(new PublicKey(answer));
  let buff = Buffer.from(JSON.stringify(res.value!.data));
  let resultf = JSON.parse(buff.toString());
  let resy = await connection.getSignaturesForAddress(new PublicKey(resultf.parsed.info.mintAuthority));
  let skip = false;

  if (resy.length > 500) {
    resy = await connection.getSignaturesForAddress(new PublicKey(answer));
  }

  const ded = await connection.getTransaction(resy[resy.length-1].signature);
  let buf = Buffer.from(JSON.stringify(ded!.meta));
  let results = JSON.parse(buf.toString());
  let buf_ = Buffer.from(JSON.stringify(ded!.transaction));
  let results_ = JSON.parse(buf_.toString());
  results = results.innerInstructions;
  if (results.length > 0) {
    let instr = results[results.length - 1].instructions;
    let accounts = instr[instr.length - 1].accounts;
    let IDIndex = accounts[accounts.length - 1];

    console.log("\nAn ID was Found");
    console.log("Validating...");

    let mintAddr = await getMintAddresses(new PublicKey(results_.message.accountKeys[IDIndex]));

    if (mintAddr > 0) {
        skip = true;
        console.log("Valid")
        console.log("\nPossible Project ID with " + mintAddr + " NFTS: " + results_.message.accountKeys[IDIndex]);
    }
  }


  if (!skip) {
    console.log("ID found had no NFTs, starting a deeper search");

  for (let i = 0; i < results_.message.accountKeys.length; i++) {
    if (results_.message.accountKeys[i].length != 44) {
      continue;
    }
    let mintAddr_ = await getMintAddresses(new PublicKey(results_.message.accountKeys[i]));
    if (mintAddr_ > 0) {
        console.log("\nPossible Project ID with " + mintAddr_ + " NFTS: " + results_.message.accountKeys[i]);
        break;
    }
}
}
  })()
  rl.close();
});
