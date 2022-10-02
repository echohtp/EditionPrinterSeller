# Edition Seller

Sell editions of your Master Edition Metaplex NFTs and collect payment in any SPL token.

## Setup
Clone this repo and install deps
```
git clone https://github.com/echohtp/EditionPrinterSeller
cd EditionPrinterSeller
yarn
```

.env file with the following key/values
```
SK=PRIVATE_KEY_THAT_HAS_UPDATE_AUTHORITY_ON_THE_MASTEREDITION_NFT_BASE58
NEXT_PUBLIC_NFT=GLE8YHQ2DFPgBPH977VRTiXs5A2vaQoAAEvPqsVmKNWx //The nft to make prints from
NEXT_PUBLIC_SPLTOKEN=6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce //SPL Token to collect fees in
NEXT_PUBLIC_BANK=232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC // FUNDS RECEIVER 
NEXT_PUBLIC_BANK_ATA=437mKN7wtYVkH8cUgDR4Lyi4bfUyWnChvh62Nk6y8yix // ATA OF THE FUNDS RECIEVER 
NEXT_PUBLIC_PRICE=50 // HOW MUCH?
NEXT_PUBLIC_SYMBOL=BNON // CURRENCY SYMBOL
```

run
```
yarn dev
```

build
```
yarn build
```


## Deploy on Vercel or Netlify
The easiest way to deploy is to use Vercel or Netlify. Please refer to their documentation for more details.

---
## ToDo
 - Atomic instructions would be nice
 - Message sign before mint
