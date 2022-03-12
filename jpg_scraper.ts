//William Ambrozic 2022
//Code adapted from https://solanacookbook.com/references/nfts.html#candy-machine-v1

//TODO better error handling

import { Connection, clusterApiUrl, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import axios from "axios"
import * as fs from 'fs';
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

   //Getting mint addresses from candy machine ID
   let mintAddr: any = [];

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
   let errorAddr = [];

   console.log("Found " + mintLen + " mint addresses");

   //Creating images folder in current directory
   if (!fs.existsSync("./images")){
     fs.mkdirSync("./images");
   }

   //Creating hashmap to store name counts (incase NFTs have the same name)
   let nftNames = new Map();

  //Looping through each mint ownerAddress
  for (let i = 0; i < mintLen; i++) {
     //Fetching owners by mint ownerAddress
     try {
       const metadataPDA = await Metadata.getPDA(new PublicKey(mintAddr[i]));
       const tokenMetadata = await Metadata.load(connection, metadataPDA);
       const result = await axios.get(tokenMetadata.data.data.uri)
       const url = result.data.properties.files[0].uri;
       const name = tokenMetadata.data.data.name

       //Creating new directory in images with the project id
       let dir = "";
       if (config.data.custom_project_name == "") {
         dir = "./images/" + config.data.mint_id;
         console.log("(" + (i+1) + "/" + mintLen + ") DOWNLOADING: " + name + " to " + dir);
       } else {
        dir = "./images/" + config.data.custom_project_name;
        console.log("(" + (i+1) + "/" + mintLen + ") DOWNLOADING: " + name + " to " + dir);
       }

       //Adding name count to hashmap or initializing
       if (!nftNames.has(name)) {
        nftNames.set(name, 1);
      } else {
        nftNames.set(name, nftNames.get(name)+1);
      }

       if (i == 0 && !fs.existsSync(dir)){
         fs.mkdirSync(dir);
       }

       //Getting image type
       let type = result.data.properties.files[0].type;

      //Downloading image
      axios({
        method: "get",
        url: url,
        responseType: "stream"
      }).then(function (response) {
        if (config.data.save_jpg_as_nft_name) {
          if (nftNames.get(name) > 1) {
              response.data.pipe(fs.createWriteStream(dir + "/" + name + "-" + nftNames.get(name) + "." + type.substring(type.indexOf('/') + 1)));
          } else {
            response.data.pipe(fs.createWriteStream(dir + "/" + name + "." + type.substring(type.indexOf('/') + 1)));
          }
      } else {
        response.data.pipe(fs.createWriteStream(dir + "/" + mintAddr[i] + "." + type.substring(type.indexOf('/') + 1)));
      }
      });
    } catch(error) {
      console.log("(" + (i+1) + "/" + mintLen + ") DOWNLOADING: " + "ERROR SKIPPING");
      errorAddr.push(mintAddr[i]);
  }
  }
  if (errorAddr.length > 0) {
    console.log("There were errors with " + errorAddr.length + " jpgs");
    console.log("Mint addresses not downloaded: ");
    console.log(errorAddr);

  } else {
    console.log("\nFiles downloaded to ./images/ with no errors :)");
  }
})()
