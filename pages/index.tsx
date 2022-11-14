/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { PublicKey, Transaction } from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
import Confetti from 'react-confetti'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT
} from '@solana/spl-token'
import { toast } from 'react-toastify'
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import styles from '../styles/Home.module.css'
import { Edition, priceTag } from '../components/edition'
import mintsOnSale from '../data/onsale'
import Footer from '../components/Footer'

const CLOSED = false

const Home: NextPage = () => {
  const { publicKey, connected, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [error, setError] = useState<boolean>(false)
  const [confetti, setConfetti] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const doIt = async (priceTags: priceTag[], _index: number) => {
    if (!publicKey) return

    let tx = new Transaction()

    let destination
    for (var i = 0; i < priceTags.length; i++) {
      console.log('Lets do setup some instructions')
      console.log('Cost: ', priceTags[i].price)
      console.log('SplToken: ', priceTags[i].splToken)
      console.log('Reciever: ', priceTags[i].bank)
      console.log('Sender: ', publicKey?.toBase58())

      if (priceTags[i].splToken == NATIVE_MINT.toBase58()) {
        destination = new PublicKey(priceTags[i].bank)
      } else {
        destination = new PublicKey(priceTags[i].bankAta!)
      }

      if (priceTags[i].splToken != NATIVE_MINT.toBase58()) {
        const source = await getAssociatedTokenAddress(
          new PublicKey(priceTags[i].splToken),
          publicKey!
        )

        console.log('Receiver ATA: ', destination.toBase58())
        console.log('Sender ATA: ', source.toBase58())

        // send me bnon
        if (
          priceTags[i].splToken ==
          '6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce'
        ) {
          const ixSendMoney = createTransferInstruction(
            source,
            destination,
            publicKey!,
            priceTags[i].price * LAMPORTS_PER_SOL
          )
          tx.add(ixSendMoney)
        }
        // send me ooo
        if (
          priceTags[i].splToken ==
          'BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu'
        ) {
          const ixSendMoney = createTransferInstruction(
            source,
            destination,
            publicKey!,
            priceTags[i].price * 100
          )
          tx.add(ixSendMoney)
        }
        // send me dust
        if (
          priceTags[i].splToken ==
          'DUSTawucrTsGU8hcqRdHDCbuYhCPADMLM2VcCb8VnFnQ'
        ) {
          const ixSendMoney = createTransferInstruction(
            source,
            destination,
            publicKey!,
            priceTags[i].price * LAMPORTS_PER_SOL
          )
          tx.add(ixSendMoney)
        }
      } else {
        // send me SOLANA
        tx.add(
          SystemProgram.transfer({
            fromPubkey: publicKey!,
            toPubkey: new PublicKey(priceTags[i].bank),
            lamports: priceTags[i].price * LAMPORTS_PER_SOL
          })
        )
      }
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
            address: publicKey!.toBase58(),
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
        setConfetti(true)
        setTimeout(()=>{
          setConfetti(false)
        },10000)
      } catch (e) {
        toast(
          'There was an error, please contact support with your payment transaction id'
        )
        setError(true)
        setErrorMessage(signature)
      }
    } catch (e) {
      toast('Payment cancelled')
      console.log(e)
    }
  }

  const grids = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'
      

  return (
    <div className='flex flex-col min-h-screen'>
      {confetti && <Confetti className='w-screen h-screen' />}
      <Head>
        <title>Open Editions - Home</title>
        <meta
          name='description'
          content='Open Editions from 0xBanana and friends'
        />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <WalletMultiButton />

        <h1 className='py-4 text-6xl font-extrabold tracking-tighter text-center transition-transform ease-in-out bg-transparent sm:leading-4 md:text-8xl text-gradient bg-clip-text animated hover:scale-105 hover:skew-y-6 hover:-skew-x-6'>
          Open Editions
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
        {mintsOnSale.length == 0 || CLOSED ? (
          <>
            <img src='https://americansigncompany.com/wp-content/uploads/2020/07/Sorry-Were-Closed-We-Hope-to-Be-Back-Soon-Thank-You.jpg' />
          </>
        ) : (
          <div className={`${grids}`}>
            {mintsOnSale.map((saleItem, index) => (
                <div className='' key={'mintsonsale-' + saleItem.mint}>
                  <Edition
                    index={index}
                    connected={connected}
                    doIt={doIt}
                    priceTags={saleItem.priceTags}
                    creator={saleItem.creator}
                    mint={saleItem.mint}
                    open={saleItem.open}
                  />
                </div>
              )
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Home
