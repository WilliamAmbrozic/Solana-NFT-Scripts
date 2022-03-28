//William Ambrozic 2022
//Code adapted from https://solanacookbook.com/references/nfts.html#candy-machine-v1
//Resemble code is not mine, please see LICENSE in repo ./resemble folder

var resemble = require('./resemblejs/resemble.js');
import axios from "axios"
import * as fs from 'fs';
import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
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

const fileName = config.data.reverse_img_filename;
const candyMachineId = new PublicKey(config.data.mint_id);
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

  return metadataAccounts.map((metadataAccountInfo) => (
    bs58.encode(metadataAccountInfo.account.data)
  ));
};

(async () => {
  let file = fs.readFileSync(fileName);

  let mintAddr:any = [];
  console.log("Fetching Mint Addresses (this may take a few minutes, sit back)");

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

  let lowest_score = 101;
  let index = 0;

  for (let i = 0; i < mintLen; i++) {
    try {

  const metadataPDA = await Metadata.getPDA(new PublicKey(mintAddr[i]));
  const tokenMetadata = await Metadata.load(connection, metadataPDA);
  const result = await axios.get(tokenMetadata.data.data.uri);
  let skip = false;

  let filters = config.data.reverse_img_attr_filters;
  for (let filter of filters) {
    for (let i = 0; i < result.data.attributes.length; i++) {
      if (result.data.attributes[i].trait_type == filter.trait_type && result.data.attributes[i].value != filter.value ) {
        skip = true;
        break;
      }
    }
    if (skip) {
      break;
    }
  }

  if (skip) {
    continue;
  }

  let url = result.data.image;

  await axios({
    method: "get",
    url: url,
    responseType: "arraybuffer"
  }).then(function (response) {
    var diff = resemble(file).compareTo(response.data).scaleToSameSize().ignoreAntialiasing().onComplete(function(data:any){
        if (data.rawMisMatchPercentage < lowest_score) {
          lowest_score = data.rawMisMatchPercentage;
          index = i;
        }
        console.log("(" + (i+1) + "/" + mintLen + ") Checking: " + mintAddr[i] + " -> " + (Math.round(((100 - data.rawMisMatchPercentage) + Number.EPSILON) * 100) / 100) + "% Similarity");
    });
  });

  if (lowest_score == 0) {
    console.log("Found a perfect match");
    break;
  }
} catch (error) {
  console.log("(" + (i+1) + "/" + mintLen + ") Error on " + mintAddr[i]);
}
}
console.log("\nNFT mint address: " + mintAddr[index]);

})()
