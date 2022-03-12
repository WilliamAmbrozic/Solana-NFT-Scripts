//William Ambrozic 2022
//Code adapted from https://solanacookbook.com/references/nfts.html#candy-machine-v1

import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import config from './config.json';
import * as fs from 'fs';

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
const candyMachineId = new PublicKey(config.data.mint_id);

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

  return metadataAccounts.map((metadataAccountInfo) => (
    bs58.encode(metadataAccountInfo.account.data)
  ));
};

(async () => {
   console.log("Fetching Mint Addresses (this may take a few minutes, sit back)");
   let mintAddr = [];

   //Getting mint addresses from candy machine ID or saved JSON
   try {
     let mint = require('./mint_addr/' + config.data.mint_id + ".json");
     mintAddr = mint.mint_addr;
     console.log("Found mint addresses from local JSON file");
   } catch (error) {
     mintAddr = await getMintAddresses(candyMachineId);
     let save_json = {mint_addr: mintAddr};
     if (!fs.existsSync("./mint_addr")){
       fs.mkdirSync("./mint_addr");
     }
     fs.writeFile ("./mint_addr/" + config.data.mint_id + ".json", JSON.stringify(save_json), function(err:any) {
      if (err) throw err;
      });
   }

   let mintLen = mintAddr.length;
   console.log("Found " + mintLen + " mint addresses");

   //Creating hashmap to store address counts (nfts held)
   let ownerAddr = new Map();

//Looping through each mint ownerAddress
for (let i = 0; i < mintLen; i++) {
   //Fetching owners by mint ownerAddress
   try {
   const largestAccounts = await connection.getTokenLargestAccounts(new PublicKey(mintAddr[i]));
   const largestAccountInfo = await connection.getParsedAccountInfo(largestAccounts.value[0].address);
   //Fixes dead json returned from getParsedAccountInfo
   let ded = largestAccountInfo.value!.data;
   let buf = Buffer.from(JSON.stringify(ded));
   let owner = JSON.parse(buf.toString()).parsed.info.owner;
   console.log("(" + (i+1) + "/" + mintLen + ") CHECKING: " + mintAddr[i]);

   //Adding to hashmap if not already included
   if (!ownerAddr.has(owner)) {
    ownerAddr.set(owner, 1);
  }
  //Incrementing number of nfts per account if included
  else {
    ownerAddr.set(owner, ownerAddr.get(owner)+1);
  }
} catch(error) {
  console.log("(" + (i+1) + "/" + mintLen + ") CHECKING: " + "ERROR SKIPPING");
}
 }

 //Sorting to get top holders
 let holders = [];
 for (let key of ownerAddr.keys()) {
   holders.push({
     ownerAddress: key,
     nftCount: ownerAddr.get(key)
   });
 }

 let holders_sorted = holders.sort(function(a, b) {
  return (b.nftCount > a.nftCount) ? 1 : ((a.nftCount > b.nftCount) ? -1 : 0)
});

  let uniqueHolders = ownerAddr.size;

  console.log("\n=====================================================================")

 console.log("\nYour project has " + uniqueHolders + " unqiue holders\n");

 if (mintLen >= 15) {
 console.log("Top 15 holders:");
 for (let i = 0; i < 15; i++) {
   console.log((i+1) + ". " + holders_sorted[i]['ownerAddress'] + " owns " + holders_sorted[i]['nftCount'] + "/" + mintLen + " (" + (Math.round(((holders_sorted[i]['nftCount']/mintLen*100) + Number.EPSILON) * 1000) / 1000) + "%)");
 }
} else {
  console.log("Top holder:");
  console.log("1. " + holders_sorted[0]['ownerAddress'] + " owns " + holders_sorted[0]['nftCount'] + "/" + mintLen + " (" + (Math.round(((holders_sorted[0]['nftCount']/mintLen*100) + Number.EPSILON) * 1000) / 1000)+ "%)");
}

//Calculating lower holdings
let amountHeld = [0,0,0,0,0];
let i = uniqueHolders - 1;
while (holders_sorted[i]['nftCount'] <= 5 && i > 0) {
  if (holders_sorted[i]['nftCount'] == 1) {
    amountHeld[0]++;
  } else if (holders_sorted[i]['nftCount'] == 2) {
    amountHeld[1]++;
  } else if (holders_sorted[i]['nftCount'] == 3){
    amountHeld[2]++;
  } else if (holders_sorted[i]['nftCount'] == 4){
    amountHeld[3]++;
  } else {
    amountHeld[4]++;
  }
  i--;
}
console.log("\nLower holdings distribution: ");
for( let i = 0; i < 5; i++) {
  console.log(amountHeld[i] + " wallets hold", (i+1) , "NFT " + amountHeld[i] + "/" + uniqueHolders + " wallets (" + (Math.round(((amountHeld[i]/uniqueHolders*100) + Number.EPSILON) * 1000) / 1000)+ "%)");
}
})()
