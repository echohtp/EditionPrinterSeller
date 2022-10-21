/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { PublicKey, SendTransactionError, Transaction } from '@solana/web3.js'
import { Button } from 'antd'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
// import ConfettiExplosion from 'react-confetti-explosion'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT
} from '@solana/spl-token'
import { useMemo } from 'react'
import { toast } from 'react-toastify'
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import styles from '../styles/Home.module.css'
import { Edition } from '../components/edition'
import mintsOnSale from '../data/onsale'
import Lightbox from 'react-image-lightbox'

const CUSTOM_TOKEN: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_SPLTOKEN!)
const BANK: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BANK!)
const BANK_ATA: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BANK_ATA!)
const COST: number = Number(process.env.NEXT_PUBLIC_PRICE!) * LAMPORTS_PER_SOL // put token decimals here or you may have a problem

const Home: NextPage = () => {
  const { publicKey, connected, sendTransaction } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [canMint, setCanMint] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean[]>(
    new Array(mintsOnSale.length).fill(false)
  )
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  // const [timer, setTimer] = useState<any>()
  // const [isExploding, setIsExploding] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const jokes = ['Joke 1', 'Joke 2', 'Joke 3', 'Joke 4', 'Joke 5', 'Joke 6']

  const doIt = async (
    _cost: number,
    _custom_token: string,
    _bank: string,
    _bank_ata: string,
    _index: number
  ) => {
    if (!publicKey || !_cost || !_custom_token || !_bank) return
    let _loading = loading
    _loading[_index] = true
    setLoading(_loading)
    console.log(loading)
    console.log('Lets do the work')
    console.log('Cost: ', _cost)
    console.log('SplToken: ', _custom_token)
    console.log('Reciever: ', _bank)
    console.log('Sender: ', publicKey?.toBase58())
    let tx = new Transaction()
    let destination
    if (_custom_token == NATIVE_MINT.toBase58()) {
      destination = new PublicKey(_bank)
    } else {
      destination = new PublicKey(_bank_ata)
    }

    if (_custom_token != NATIVE_MINT.toBase58()) {
      const source = await getAssociatedTokenAddress(CUSTOM_TOKEN, publicKey!)

      console.log('Receiver ATA: ', destination.toBase58())
      console.log('Sender ATA: ', source.toBase58())

      // send me money

      const ixSendMoney = createTransferInstruction(
        source,
        destination,
        publicKey!,
        _cost * LAMPORTS_PER_SOL
      )
      tx.add(ixSendMoney)
    } else {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(_bank),
          lamports: _cost * LAMPORTS_PER_SOL
        })
      )
    }
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
            address: publicKey.toBase58(),
            index: _index,
            receiver: destination
          }),
          headers: {
            'Content-Type': 'application/json; charset=utf8'
          },
          method: 'POST'
        })
        const repJson = await newMint.json()
        console.log(repJson)

        toast('Minting successful!')
        let _loading = loading
        _loading[_index] = false
        setLoading(_loading)
      } catch (e) {
        toast(
          'There was an error, please contact support with your payment transaction id'
        )

        let _loading = loading
        _loading[_index] = false
        setLoading(_loading)
        setError(true)
        setErrorMessage(signature)
      }
    } catch (e) {
      toast('Payment cancelled')
      console.log(e)
      let _loading = loading
      _loading[_index] = false
      setLoading(_loading)
    }
  }

  // some funny toasts while we wait
  // useMemo(()=>{
  //   if (loading){
  //     const interval = setInterval(()=>{
  //       toast(jokes[Math.floor(Math.random()*jokes.length)])
  //     },10000)
  //   }else{
  //     setTimer(clearInterval(timer))
  //   }
  // },[loading])

  // Make sure the connected wallet has enough funds to mint.
  useMemo(async () => {
    if (!wallet.publicKey) {
      return
    }
    // public key from the address you want to check the balance for
    const ownerPublicKey = new PublicKey(wallet.publicKey)

    // public key from the token contract address
    const tokenPublicKey = new PublicKey(CUSTOM_TOKEN)

    let balance: any
    if (tokenPublicKey.toBase58() == NATIVE_MINT.toBase58()) {
      balance = await connection.getBalance(ownerPublicKey)
      console.log('bal: ', balance)
    } else {
      balance = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        mint: tokenPublicKey
      })
      balance = balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount
    }

    console.log(`token: ${tokenPublicKey.toBase58()} || balance: ${balance}`)

    balance >= Number(process.env.NEXT_PUBLIC_PRICE!)
      ? setCanMint(true)
      : setCanMint(false)
  }, [wallet.publicKey, connected])
  const image = 'https://assets1.holaplex.tools/ipfs/bafybeiatemwoesf43eqzdieojhrdxl6pgbdhnpi2llkzmq3hn3n2tibh24'
  const image_hr = '/technical_debt_hr.jpeg'
  const NFT_NAME = 'Technical Debt'
  const NFT_DESCRIPTION = "There are many reasons why technical debt may accumulate in a system..."
  return (
    <div className='flex flex-col min-h-screen'>
      {/* {isExploding && <ConfettiExplosion />} */}
      <Head>
        <title>Edition Printer</title>
        <meta name='description' content='Edition' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <WalletMultiButton />

        <h1 className='text-4xl font-extrabold tracking-tighter text-center transition-transform ease-in-out bg-transparent sm:leading-4 md:text-9xl text-gradient bg-clip-text animated hover:scale-105 hover:skew-y-6 hover:-skew-x-6'>
          Technical Debt
        </h1>
        {error && (
          <>
            <div className='relative flex flex-col items-center justify-center w-full my-4 overflow-hidden sm:py-12 lg:pb-8'>
              {/* <h2 className='text-lg font-extrabold tracking-wider text-center uppercase sm:text-2xl font-plex'>
              <span className='pb-1 sm:pb-2 whitespace-nowrap'>
                open edition mints
              </span>
            </h2> */}

              <h2 className='mx-4 my-4 tracking-wider text-center bg-yellow-200 border-yellow-300 border-dashed sm:text-2xl font-plex'>
                <span className='pb-1 sm:pb-2 whitespace-nowrap'>
                  {errorMessage}
                </span>
              </h2>
            </div>
          </>
        )}
        <div className='flex justify-center pt-5'>
          <a className='inline-block overflow-hidden transition duration-300 ease-in-out shadow-xl cursor-pointer rounded-3xl max-h-xs'>
            <div className='relative w-full overflow-hidden bg-black group rounded-t-3xl'>
              {isOpen && (
                <Lightbox
                  mainSrc={image}
                  onCloseRequest={() => setIsOpen(false)}
                  imageTitle={NFT_NAME + " -----> Press the (+) button if the image doesnt load"}
                  imageCaption={NFT_DESCRIPTION}
                />
              )}
              <img
                src={"technical_debt_lr.png"}
                className='object-cover w-[600px] h-full duration-700 transform backdrop-opacity-100'
                onClick={() => setIsOpen(true)}
              />
            </div>
            <div className='bg-white'>
              {!connected && (
                <div className='px-3 pt-2 pb-6 text-center'>
                  <p className='mt-2 font-sans font-light text-slate-700'>
                    Please connect your wallet.
                  </p>
                </div>
              )}
              {connected && (
                <div className='px-3'>
                  <div className="px-3">
                  <p className='mt-2 mb-2 font-sans text-slate-700'>There are many reasons why technical debt may accumulate in a system.<br/>Some common causes include:</p> 
                  <ul className='mb-2 ml-8 font-sans text-slate-700' style={{listStyle: "square outside"}}>
                    <li>Lack of foresight</li>
                    <li>Lack of understanding</li>
                    <li>Lack of resources</li>
                  </ul>
                    <p className='font-sans text-slate-700'>The result? A <b>beautiful unmanageable</b> monstrosity.</p>
                    </div>
                  <div className='grid grid-cols-2 gap-4'>
                    {mintsOnSale.map((saleItem, index) => (
                      <div key={index}>
                        <Edition
                          index={index}
                          connected={connected}
                          canMint={canMint}
                          cost={saleItem.price}
                          symbol={saleItem.symbol}
                          doIt={doIt}
                          splToken={saleItem.splToken}
                          tokenMint={saleItem.mint}
                          image={saleItem.image}
                          bank={saleItem.bank}
                          bankAta={saleItem.bankAta}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </a>
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
