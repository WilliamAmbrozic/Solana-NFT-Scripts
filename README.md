# Solana NFT Scripts

**WARNING: PLEASE READ**: There has recently (March 28th, 2022) been some [issues](https://twitter.com/GenesysGo/status/1508295993581871104?s=20&t=gujt07kgI2PpgmyhHDclzg) with Solana RPC's. If you get an error using these scripts such as ```Error: 403 Forbidden: Call type exceeds Solana 1.9.13 version limit for max account size```, [this](https://twitter.com/GenesysGo/status/1508295993581871104?s=20&t=gujt07kgI2PpgmyhHDclzg) is likely why. This warning will be deleted if either the RPC issues fix themselves or a work around for these scripts to function is discovered. The scripts in this repo are affected as they use GPA calls and will likely not function (unless your RPC provider allows GPA) if you are seeing this warning message. See issue [#4](https://github.com/WilliamAmbrozic/Solana-NFT-Scripts/issues/4).

# Details
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;A collection of scripts written in typescript for NFT analysis on the Solana blockchain. All scripts in this repo strictly access data from the Solana blockchain (RPC) without use of any external APIs (ex. MagicEden, HowRare, etc).

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;These scripts use the https://ssc-dao.genesysgo.net RPC by default, you can speed up the process by using your own endpoint and placing it in the config.json file. All input (aside from id_finder.ts) goes inside the config.json file as described in detail below. These scripts may take time to run, some changes have been made to accommodate this. For example, after any script fetches a projects mint addresses a json file will be created under ./mint_addr named after the projects CandyMachine ID. This allows for the scripts to fetch as little as possible (time consuming).

**Market place analytics:** If you are looking for marketplace analysis tools, please check out my other repo [here](https://github.com/WilliamAmbrozic/MagicEden-NFT-Scripts).  

## Contents
- [Preface](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Preface)  
  - [Manual Exploring](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Preface)
- [Scripts](https://github.com/WilliamAmbrozic/Solana-NFT-AnalyNFTstics-Tools#Scripts)  
  - [Holder Distribution](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Holder-Distribution)  
  - [Batch Download NFT's (JPG Scraper)](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#JPG-Scraper)  
  - [Reverse Image Search](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#reverse-image-search)  
  - [Fetch Mint Addresses](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Fetch-Mint-Addresses)  
  - [Fetch Metadata (uri)](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Fetch-Metadata)  
- [Config](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)  
- [Running the Scripts](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Running-the-Scripts) 
  - [Installing](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Installing) 
  - [Running](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Running) 
  - [Finding your CandyMachine ID](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Finding-your-CandyMachine-ID) 
- [Credit](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#credit)
- [Find Me](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#find-me)
- [Tip Jar](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Solana-Tip-Jar)

## Preface

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

### Manual Exploring

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Like most other crytocurrencies Solana relies on a public information ledger, it is this ledger which the scripts below query. Websites such as https://https://explorer.solana.com/ offer a great user interface for exploring the blockchain; however, as of writting do not provide in-depth tools for analyzing NFT data. The scripts in this repo attempt to mitigate this in an opensource manner. 

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;That being said the scripts in this repo often output data such as an NFT's mint address (think of a mint address as the serial code of an NFT). Say you wanted to know the wallet address of an individual who owns a specific NFT you have a digital copy of (the literal png/jpg/gif file off-chain). In this case one can use the reverse image search tool, get the mint address, and then go to https://explorer.solana.com/address/MINT_ADDRESS (MINT_ADDRESS replaced by the found mint address). It is here where a user can understand more about a given NFT. This includes the owning wallet, transaction history, the NFT's metadata, etc.
  
![Shot 2](https://imgur.com/chlyR3H.png)

## Scripts

## Holder Distribution

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**holder_distribution.ts** 
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Outputs the number of unique holders of a 1/1 NFT project (unique mint address) along with distribution information.

### Sample Output

![Shot 1](https://imgur.com/x9ohJCu.png) 

## JPG Scraper

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**jpg_scraper.ts**
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Scrapes all NFT image files from the metadata uri of each and then downloads them in a folder (CandyMachine ID named) under ./images. If you would like files to be named after the NFT name rather than the mint address see [Config Optional Attributes](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config).

### Sample Output

![Shot 2](https://imgur.com/sioIRuF.png)

## Reverse Image Search

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**reverse_image_search_nft.ts**
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Reverse image search a given NFT image. This program will output the mint address of the most visually similar NFT image in the given collection. Place the desired image where the script and the folder ./resemblejs are located. Paste in the projects CandyMachine ID and image file name in the config file.

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;To speed up the process one can add attribute filters in the config file. An example is shown below. The desired format matches what one would find in an NFT's uri. This filters out any NFT that does not have these attributes so the script does not have to fetch its image and compare.
```
"reverse_img_attr_filters": [
      {
        "trait_type": "Background",
        "value": "Green"
      },
      {
        "trait_type": "Eyes",
        "value": "Beads"
      }
    ]
```

## Fetch Mint Addresses

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**get_mint_json.ts**
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This script will fetch all mint addresses associated with the CandyMachine ID in your config file and store them in a json array located in ./mint_addr. The file will be named after the CandyMachineID.json. This script will update the file if it already exists. If you would like the json file to be named after the project name rather than the project ID see [Config Optional Attributes](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config).

## Fetch Metadata

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**get_metadata_json.ts**
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;This script will fetch all uri metadata associated with the CandyMachine ID in your config file and store them in a json array located in ./metadata. The file will be named after the CandyMachineID.json. This script will update the file if it already exists. If you would like the json file to be named after the project name rather than the project ID see [Config Optional Attributes](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config).

## Config

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Each script requires different input data from the config.json file. Please refer to the table below before running each script. Each cell tells you if the associated script needs the appropriate config json attribute to function.

| Script\config attr         | **RPC** | **mint_id** | **reverse_img_filename** | **reverse_img_attr_filter** |
|----------------------------|---------|-------------|--------------------------|-----------------------------|
| **get_mint_json**          | YES     | YES         | NO                       | NO                          |
| **holder_distribution**    | YES     | YES         | NO                       | NO                          |
| **id_finder**              | YES     | NO          | NO                       | NO                          |
| **jpg_scraper**            | YES     | YES         | NO                       | NO                          |
| **reverse_img_search_nft** | YES     | YES         | YES                      | YES                         |
| **get_mint_json.ts**       | YES     | YES         | NO                       | NO                          |
| **get_metadata_json.ts**   | YES     | YES         | NO                       | NO                          |

## Optional Config Attributes
**save_jpg_as_nft_name**: Change this from false (default) to true if you would like image files to be named with the NFTs name rather than its mint address.
* Used for **jpg_scraper.ts**

**custom_project_name**: Change this from "" (default) to a project name if you would like metadata, mint address json, or the save folder name for image files to be named after the specified project name rather than its ID.
* Used for **get_metadata_json.ts**, **get_mint_json.ts** and **jpg_scraper.ts**


```
{
  "data": {
    "RPC": "https://ssc-dao.genesysgo.net",
    "mint_id": "ALNcW6QDNf7H4iNiTM3FD16LZ4zMGyEeCYQiE1AbCoXk",
    "reverse_img_filename": "solgod.png",
    "reverse_img_attr_filters": [
      {
        "trait_type": "Background",
        "value": "Green"
      },
      {
        "trait_type": "Eyes",
        "value": "Beads"
      }
    ],
    "save_jpg_as_nft_name": true,
    "custom_project_name": "SolGods"
  }
}
```

### Installing

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

Enter your command prompt or terminal on a machine with Git & NodeJS, run the following commands:

Mac/Linux/Windows
```
git clone https://github.com/WilliamAmbrozic/Solana-NFT-Scripts.git
cd Solana-NFT-Scripts
npm install
npm install typescript
npm install bs58
```

### Running 

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

Follow the [config requirments](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)   for each script and then run using:
```
ts-node SCRIPT_NAME_HERE
```
For example run id_finder.ts like so:
```
ts-node id_finder.ts
```

### Finding your CandyMachine ID

[[Back to contents]](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#contents)

**id_finder.ts**
[See Config for Input](https://github.com/WilliamAmbrozic/Solana-NFT-Analytics-Tools#Config)

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The script above will prompt the user for the mint address of one of the NFT's in the desired collection and attempt to retrieve its collections CandyMachine ID. A simple way of retrieving a mint ID from a collection is to search the project on https://magiceden.io and click on one of the listings. A mint ID will be present after the /item-details/ in the url as seen below.

![Shot 3](https://imgur.com/KDw8Tzr.png)

### Alternatives

* If you do not know your CandyMachine ID, at the time of writting this magiceden has an open endpoint at https://api-mainnet.magiceden.io/all_collections (ctrl f search your project, property: candyMachineIds). 
* If your project is not present with MagicEden and the script is no help, try searching your NFT on https://explorer.solana.com/ by its mint address. The ID should be a signature address in the very first transaction.

## Credit
* Code adapted from the [Solana Cookbook](https://solanacookbook.com/).
* [ResembleJS](https://github.com/rsmbl/Resemble.js) was used for NFT reverse image search (the code inside the resemblejs folder is not mine - see license).

## Find Me

- [williamambrozic.info](https://williamambrozic.info)
- [Twitter](https://twitter.com/WilliamAmbrozic)

## Solana Tip Jar
  * wia.sol 
  * 8vU6RfyFDk9WriVgaJohBxqtE86TLtjAR8cPWjdU6zEN
### Bitcoin
  * bc1qa7vkam2w4cgw8njqx976ga5ns8egsq3yzxzlrt


