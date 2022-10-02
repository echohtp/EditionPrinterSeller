/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import {
  PublicKey,
  SendTransactionError,
  Transaction,
} from '@solana/web3.js'
import { Button } from 'antd'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
import {
  createTransferInstruction,
  getAssociatedTokenAddress
} from '@solana/spl-token'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import styles from '../styles/Home.module.css'
import { Edition } from '../components/edition'

const CUSTOM_TOKEN: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_SPLTOKEN!)
const BANK: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BANK!)
const BANK_ATA: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BANK_ATA!)
const COST: number = Number(process.env.NEXT_PUBLIC_PRICE!) * LAMPORTS_PER_SOL // put token decimals here or you may have a problem

const Home: NextPage = () => {
  const {
    publicKey,
    connected,
    sendTransaction,
  } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [canMint, setCanMint] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const doIt = async () => {
    if (!publicKey) return
    setLoading(true)
    console.log('Lets do the work')
    console.log('Cost: ', COST)
    console.log('SplToken: ', CUSTOM_TOKEN.toBase58())
    console.log('Reciever: ', BANK.toBase58())
    console.log('Sender: ', publicKey?.toBase58())

    let tx = new Transaction()
    // find ATA
    const destination = BANK_ATA
    const source = await getAssociatedTokenAddress(CUSTOM_TOKEN, publicKey!)

    console.log('Receiver ATA: ', destination.toBase58())
    console.log('Sender ATA: ', source.toBase58())

    // send me money
    const ixSendMoney = createTransferInstruction(
      source,
      destination,
      publicKey!,
      COST
    )

    tx.add(ixSendMoney)

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

      toast('Payment successful, minting edition...')
      console.log('calling new mint')
      try {
        const newMint = await fetch('api/mint', {
          body: JSON.stringify({
            signature: signature,
            address: publicKey.toBase58()
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf8'
          },
          method: 'POST'
        })
        const repJson = await newMint.json()
        console.log(repJson)
        
        toast('Minting successful!')
        setLoading(false)
      } catch (e) {
        toast(
          'There was an error, please contact support with your payment transaction id'
        )
        setLoading(false)
        setError(true)
        setErrorMessage(signature)
        
      }
    } catch (e) {
      toast('Payment cancelled')
      setLoading(false)
    }
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

    console.log('Token balance: ', tokenBalance)
    console.log('cost: ', COST)

    tokenBalance * LAMPORTS_PER_SOL > COST
      ? setCanMint(true)
      : setCanMint(false)
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
            {error && 
              <h2 className='mx-4 my-4 text-lg font-extrabold tracking-wider text-center uppercase bg-yellow-200 border-yellow-300 border-dashed sm:text-2xl font-plex'>
              <span className='pb-1 sm:pb-2 whitespace-nowrap'>
                {errorMessage}
              </span>
            </h2>}
          </div>
          <Edition 
            connected={connected}
            canMint={canMint}
            cost={COST}
            symbol={process.env.NEXT_PUBLIC_SYMBOL || ""}
            doIt={doIt}
            loading={loading}
          />
        </div>
      </main>

      <footer>
        <div
          className='p-4 text-center'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}
        >
          Made with ❤️
        </div>
      </footer>
    </div>
  )
}

export default Home
