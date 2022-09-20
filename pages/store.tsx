/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  Connection
} from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'
import {
  createCreateStoreInstruction,
  CreateStoreInstructionArgs,
  CreateStoreInstructionAccounts
} from '@metaplex-foundation/mpl-fixed-price-sale'
import { JsonForms } from '@jsonforms/react'
import { materialRenderers } from '@jsonforms/material-renderers'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import { Metaplex, Nft, Metadata } from "@metaplex-foundation/js"

const createStoreSchema = {
  type: 'object',
  properties: {
    storeName: {
      type: 'string'
    },
    storeDescription: {
      type: 'string'
    }
  }
}

const initStoreData = { storeName: '', storeDescription: '' }

const Setup: NextPage = () => {
  const { publicKey, signTransaction, connected, sendTransaction } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [canMint, setCanMint] = useState<boolean>(false)
  const [createStoreData, setCreateStoredata] = useState(initStoreData)
  const [stores, setStores] = useState<any[]>([])
  const [nfts, setNfts] = useState<any[]>([])
 
  const initStore = async () => {
    if (wallet.publicKey == null) {
      console.log('need publickey')
      return
    }
    if (
      createStoreData.storeName == '' ||
      createStoreData.storeDescription == ''
    ) {
      console.log('missing store name or store description')
      return
    }

    const tx = new Transaction()

    const args: CreateStoreInstructionArgs = {
      name: createStoreData.storeName,
      description: createStoreData.storeDescription
    }

    const accounts: CreateStoreInstructionAccounts = {
      admin: wallet.publicKey,
      store: wallet.publicKey
    }

    const ixCreateStore = createCreateStoreInstruction(accounts, args)
    tx.add(ixCreateStore)

    // get recent blockhash  
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    // set whos paying for the tx
    tx.feePayer = publicKey!

    try {
      const signature = await sendTransaction(tx, connection)
      const latestBlockHash = await connection.getLatestBlockhash()
      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature
      })
    } catch (e:any) {
      console.log('Error: ', e.message)
    }
  }

  // get details of any stores we may have created
  useMemo(async () => {
    if (!publicKey) {
      return
    }
    const connection = new Connection('https://ssc-dao.genesysgo.net')
    
    const accounts = await connection.getParsedProgramAccounts(new PublicKey("SaLeTjyUa5wXHnGuewUSyJ5JWZaHwz3TxqUntCE9czo"),{
      filters: [{
        memcmp: {offset: 0, bytes: "Nn25MFiXzvM"}
      },{memcmp:{offset: 8, bytes: publicKey.toBase58()}}]
    })
    console.log("Accounts we found:")
    console.log(accounts)
    setStores(accounts)
  }, [publicKey])

  // we have a store now, sell some nfts, find master editions
  useMemo(async ()=>{
    if (publicKey){
    const connection = new Connection('https://ssc-dao.genesysgo.net')
    const metaplex = new Metaplex(connection)

    try{ 
    const metadatas = await metaplex.nfts().findAllByOwner({ owner: publicKey }).run()
    
    let ourMetadatas = metadatas.filter((n)=> n.updateAuthorityAddress.toBase58() === publicKey.toBase58())
    
    console.log("we found some nfts from metaplex: ", ourMetadatas.length)
    // STILL NEED TO FILTER FOR ONLY MASTER EDITIONS
    console.log("our nfts")
    console.log(ourMetadatas)
    let loadedNfts: Nft[] = []
    for (var i=0; i < ourMetadatas.length; i++){
      let ourMD = ourMetadatas[i]
      if (ourMD.model == "metadata"){
        const loadedNft = await metaplex.nfts().load({metadata: ourMD}).run()
        console.log("we loaded this")
        console.log(loadedNft)  
        if (loadedNft.model == "nft")
          loadedNfts.push(loadedNft)
          console.log("found this thing")
          console.log(loadedNft)
      }
    }
    
    setNfts(loadedNfts)

    }catch (e: any){
      console.log(e)
    }
    }

  }, [stores])

  return (
    <div className='flex flex-col min-h-screen'>
      <Head>
        <title>Edition Printer</title>
        <meta name='description' content='Edition' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <WalletMultiButton />

        <h1 className='font-extrabold tracking-tighter text-center transition-transform ease-in-out bg-transparent sm:leading-4 text-7xl md:text-9xl text-gradient bg-clip-text animated hover:scale-105 hover:skew-y-6 hover:-skew-x-6'>
          Edition Printer
        </h1>
        <div className='relative flex flex-col items-center justify-center w-full py-8 overflow-hidden sm:py-12 lg:pb-8'>
          <div className='flex flex-col items-center pb-5'>
            <h2 className='text-lg font-extrabold tracking-wider text-center uppercase sm:text-2xl font-plex'>
              <span className='pb-1 sm:pb-2 whitespace-nowrap'>
                open edition mints
              </span>
            </h2>
          </div>
          <div className='flex justify-center pt-5'>
            <a className='rounded-3xl inline-block overflow-hidden shadow-xl max-w-xs cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-102 duration-300 max-h-xs'>
              <div className='relative group w-full overflow-hidden bg-black rounded-t-3xl'>
                <img
                  src='/infinity.png'
                  className='object-cover w-full h-full transform duration-700 backdrop-opacity-100'
                />
                {/* <div className='absolute bg-gradient-to-t from-black w-full h-full flex items-end justify-center -inset-y-0'>
                  <h1 className='font-bold text-2xl text-white mb-2'>
                    MonkeDAO
                  </h1>
                </div> */}
              </div>
              <div className='bg-white'>
                {!connected && (
                  <div className='text-center px-3 pb-6 pt-2'>
                    <p className='mt-2 font-sans font-light text-slate-700'>
                      Please connect your wallet.
                    </p>
                  </div>
                )}
              </div>
            </a>
          </div>
          <div>
            {connected && stores.length == 0 && (
              // <div className='text-center px-3 pb-6 pt-2'>
              //   <p className='mt-2 font-sans font-light text-slate-700'>
              //     It is your time to mint.
              //   </p>
              //   <button
              //     // disabled={!canMint}
              //     onClick={doIt}
              //     className=' border rounded-lg w-24 py-3 px-3 mt-4 border-black hover:bg-black hover:text-white'
              //   >
              //     {canMint ? 'Mint me' : 'Need more tokens'}
              //   </button>
              // </div>
              <>
                <h1>Setup Store</h1>
                <h2>Create markets to sell a master edition NFT </h2>
                
                <JsonForms
                  schema={createStoreSchema}
                  data={initStoreData}
                  renderers={materialRenderers}
                  onChange={({ errors, data }) => setCreateStoredata(data)}
                />
                <button className='px-6 py-6 border rounded-lg border-black ' onClick={initStore}>Create store</button>
              </>
            )}

          {connected && stores.length > 0 && nfts.length > 0 && (
          <div className="grid grid-cols-1">
          {nfts.map((n: Nft)=>
          <div className='px-4 py-4 my-4 border border-black border-dashed'>
            <Link href={`/mint/${n.mint.address}`}>{n.json?.name}</Link>
            <img height={100} width={100}  src={n.json?.image}/>
            <Link href={`/sell/${n.mint.address}`}><button>Sell it</button></Link>
          </div>)}
          </div>)}
          </div>
        </div>
      </main>

      <footer>
        <div
          className='text-center p-4'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          Made with ❤️
        </div>
      </footer>
    </div>
  )
}

export default Setup
