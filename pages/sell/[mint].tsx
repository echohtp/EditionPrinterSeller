import { JsonForms } from '@jsonforms/react'
import { materialRenderers } from '@jsonforms/material-renderers'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { Metaplex, Nft, Metadata } from '@metaplex-foundation/js'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from 'antd'
import {
  createCreateMarketInstruction,
  CreateMarketInstructionArgs,
  CreateMarketInstructionAccounts,
  findTreasuryOwnerAddress,
  createInitSellingResourceInstruction,
  InitSellingResourceInstructionAccounts,
  InitSellingResourceInstructionArgs,
  findVaultOwnerAddress
} from '@metaplex-foundation/mpl-fixed-price-sale'
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  Connection
} from '@solana/web3.js'
import * as bn from 'bn.js'


import { createTokenAccount } from '../../util/utils'
import { findMetadataPda, findMasterEditionV2Pda, findTokenWithMintByMintOperation, FindTokenWithMintByMintInput } from '@metaplex-foundation/js'

const createStoreSchema = {
  type: 'object',
  properties: {
    sellPrice: {
      type: 'number'
    },
    sellCurrency: {
      type: 'string',
      oneOf: [
        {
          const: 'So11111111111111111111111111111111111111112',
          title: 'Solana'
        },
        {
          const: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
          title: 'USDC'
        }
      ]
    },
    splToken: {
      type: 'string'
    },
    startTime: {
      type: 'string',
      format: 'date-time'
    },
    mintLimit: {
      type: 'integer'
    }
  }
}

const initSaleData = {
  mintLimit: 0,
  sellPrice: 1,
  sellCurrency: 'So11111111111111111111111111111111111111112',
  startTime: new Date('2022-09-19T18:05:30-04:00'),
  splToken: ''
}

const SellNft: NextPage = () => {
  const [nft, setNft] = useState<Nft | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [sending, setSending] = useState<boolean>(false)
  const [saleData, setSaleData] = useState(initSaleData)
  const router = useRouter()
  const { mint } = router.query
  const wallet = useWallet()
  const { sendTransaction } = useWallet()


  // Load the NFT supplied via url
  useMemo(async () => {
    setLoading(true)
    if (mint) {
      const connection = new Connection('https://ssc-dao.genesysgo.net')
      const metaplex = new Metaplex(connection)
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mint!) })
        .run()
      if (nft.model == 'nft') {
        setNft(nft)
      }
      setLoading(false)
    }
  }, [mint])

  const sellIt = async () => {
    if (!wallet || !wallet.publicKey) return
    if (!nft) return
    if (!mint) return

    setSending(true)
    const connection = new Connection('https://ssc-dao.genesysgo.net')

    // create selling resource


      const [vaultOwner, vaultOwnerBump] = await findVaultOwnerAddress(new PublicKey(mint), wallet.publicKey);
      const { tokenAccount: vault, createTokenTx } = await createTokenAccount({
        payer: wallet.publicKey,
        mint: new PublicKey(mint),
        connection,
        owner: vaultOwner,
      });

      const TXcreateTokenAccount = new Transaction()

      TXcreateTokenAccount.add(createTokenTx)

        // get recent blockhash
        TXcreateTokenAccount.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    // set whos paying for the tx
    TXcreateTokenAccount.feePayer = wallet.publicKey!

    try {
      const signature = await sendTransaction(TXcreateTokenAccount, connection)
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      })
    } catch (e:any) {
      console.log('Error: ', e.name," " , e.message)
      return
    }

      const sellingResource = Keypair.generate();

      const initSellingArgs: InitSellingResourceInstructionArgs = {
          masterEditionBump: 0, // WHERE DOES THIS COME FROM?
          vaultOwnerBump: vaultOwnerBump,
          maxSupply: 0 // DOES THIS MEAN UNLIMITED?
        
      }
      const metadata = findMetadataPda(new PublicKey(mint))
      const masterEdition = findMasterEditionV2Pda(new PublicKey(mint))
      const resourceToken = findTokenWithMintByMintOperation({mint: new PublicKey(mint), address: wallet.publicKey, addressType: "owner"})
      const initSellingAccounts: InitSellingResourceInstructionAccounts = {
        store: store, // this is unhappy
        admin: wallet.publicKey,
        sellingResource: sellingResource.publicKey,
        sellingResourceOwner: wallet.publicKey,
        metadata: metadata,
        masterEdition: masterEdition,
        resourceMint: new PublicKey(mint),
        resourceToken: resourceToken, // this is unhappy
        vault: vault.publicKey,
        owner: vaultOwner,
      }

      const ixInitSellingResource = createInitSellingResourceInstruction(initSellingAccounts, initSellingArgs)

    //


    const [treasuryOwner, treasuryOwnerBump] = await findTreasuryOwnerAddress(
      wallet.publicKey,
      new PublicKey(mint)
    )

    const saleCurrency =
      saleData.splToken == '' ? saleData.sellCurrency : saleData.splToken
    const startDate = Math.round(Date.now() / 1000) + 5

    const tx = new Transaction()
    const args: CreateMarketInstructionArgs = {
      treasuryOwnerBump: treasuryOwnerBump,
      name: nft?.name,
      description: nft.json?.description || '',
      mutable: true,
      price: saleData.sellPrice,
      piecesInOneWallet: saleData.mintLimit,
      startDate: startDate,
      endDate: startDate + 100,
      gatingConfig: null
    }
    
    let market = new Keypair();
    const accounts: CreateMarketInstructionAccounts = {
      market: market.publicKey,
      store: wallet.publicKey,
      sellingResourceOwner: wallet.publicKey,
      sellingResource: new PublicKey(mint),
      mint: new PublicKey(saleCurrency),
      treasuryHolder: wallet.publicKey,
      owner: wallet.publicKey
    }


    console.log("================== ACCOUNTS ==================")
    console.log("market: ", accounts['market'].toBase58())
    console.log("store: ", accounts['store'].toBase58())
    console.log("sellingResourceOwner: ", accounts['sellingResourceOwner'].toBase58())
    console.log("sellingResource: ", accounts['sellingResource'].toBase58())
    console.log("mint: ", accounts['mint'].toBase58())
    console.log("treasuryHolder: ", accounts['treasuryHolder'].toBase58())
    console.log("owner: ", accounts['owner'].toBase58())
    console.log("==============================================")


    console.log("=================== ARGS =====================")
    console.log('treasuryOwnerBump: ', args['treasuryOwnerBump'])
    console.log('name: ', args['name'])
    console.log('description: ', args['description'])
    console.log('mutable: ', args['mutable'])
    console.log('price: ', args['price'])
    console.log('piecesInOneWallet: ', args['piecesInOneWallet'])
    console.log('startDate: ', args['startDate'])
    console.log('endDate: ', args['endDate'])
    console.log('gatingConfig: ', args['gatingConfig'])
    console.log("==============================================")



    const ix = createCreateMarketInstruction(accounts, args)

    tx.add(ix)

    // get recent blockhash
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    // set whos paying for the tx
    tx.feePayer = wallet.publicKey!

    try {
      const signature = await sendTransaction(tx, connection)
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      })
    } catch (e:any) {
      console.log('Error: ', e.name," " , e.message)
    }
    setSending(false)
  }

  return (
    <>
      {loading && nft == null && (
        <>
          <h1>Loading...</h1>
        </>
      )}
      {!loading && nft == null && (
        <>
          <h1>Mint hash not supplied</h1>
        </>
      )}
      {nft != null && (
        <div className='w-1/2 ml-[25%]'>
          <h1>Configure Sale</h1>
          <h2>{nft.name}</h2>
          <h3>{nft.json?.description}</h3>
          <img height={400} width={400} src={nft.json?.image} />
          <JsonForms
            schema={createStoreSchema}
            data={initSaleData}
            renderers={materialRenderers}
            onChange={({ errors, data }) => setSaleData(data)}
          />
          <Button
            loading={sending}
            className='px-4 py-4 border border-black rounded-lg'
            onClick={sellIt}
          >
            Create Market
          </Button>
        </div>
      )}
    </>
  )
}

export default SellNft
