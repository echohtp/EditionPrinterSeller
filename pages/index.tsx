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
import {
  BigNumber,
  toBigNumber,
  findMasterEditionV2Pda,
  findMetadataPda,
  findEditionPda,
  findAssociatedTokenAccountPda
} from '@metaplex-foundation/js'
import styles from '../styles/Home.module.css'


import {
  Metaplex,
  walletAdapterIdentity
} from '@0xbanana/js'

import { useMemo } from 'react'
import {
  COST,
  CUSTOM_TOKEN,
  BANK,
  ART_UPDATE_AUTHORITY,
  MASTER_EDITION_ADDRESS,
  EDITION_MARKER_BIT_SIZE,
  PRICE,
  TOKEN_METADATA_PROGRAM_ID
} from '../util/constants'
import { toast } from 'react-toastify'

const Home: NextPage = () => {
  const { publicKey, signTransaction, connected, sendTransaction } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [canMint, setCanMint] = useState<boolean>(false)

  const doIt = async () => {
    if (!publicKey) return
    console.log("yerp")

    const connection = new Connection('https://ssc-dao.genesysgo.net')

    const metaplex = Metaplex.make(connection).use(
      walletAdapterIdentity(wallet)
    )

    const newNft = metaplex.nfts().printNewEdition({originalMint: MASTER_EDITION_ADDRESS}).run()
  }

  // Make sure the connected wallet has enough funds to mint.
  useMemo(async () => {
    if (!publicKey) {
      return
    }
    // public key from the address you want to check the balance for
    const ownerPublicKey = new PublicKey(publicKey)

    // public key from the token contract address
    const tokenPublicKey = new PublicKey(CUSTOM_TOKEN)

    const balance = await connection.getParsedTokenAccountsByOwner(
      ownerPublicKey,
      { mint: tokenPublicKey }
    )

    const tokenBalance =
      balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount
    setTokenBalance(tokenBalance)
    ;(tokenBalance as number) > PRICE ? setCanMint(true) : setCanMint(false)
  }, [publicKey])

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
                {connected && (
                  <div className='text-center px-3 pb-6 pt-2'>
                    <p className='mt-2 font-sans font-light text-slate-700'>
                      It is your time to mint.
                    </p>
                    <button
                      // disabled={!canMint}
                      onClick={doIt}
                      className=' border rounded-lg w-24 py-3 px-3 mt-4 border-black hover:bg-black hover:text-white'
                    >
                      {canMint ? 'Mint me' : 'Need more tokens'}
                    </button>
                  </div>
                )}
              </div>
            </a>
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

export default Home
