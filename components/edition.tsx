import { Button } from 'antd'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT
} from '@solana/spl-token'
import {toast} from 'react-toastify'
import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import { Transaction } from '@solana/web3.js'
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'

export interface EditionProps {
  connected: boolean
  canMint: boolean
  cost: number
  symbol: string
  doIt: any
  tokenMint: string
  splToken: string
  bank: string
  bankAta: string
  image: string
  index: number
}

export const Edition = (props: EditionProps) => {
  const { connected, cost, symbol, tokenMint, image, splToken, bank, bankAta, doIt, index } = props
  const wallet = useWallet()
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!)
  const [canMint, setCanMint] = useState<boolean>(false)
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  // const mintIt = async () => {
  //   if (!wallet.publicKey) return
  //   setLoading(true)
  //   console.log('Lets do the work')
  //   console.log('Cost: ', cost)
  //   console.log('SplToken: ', splToken)
  //   console.log('Reciever: ', bank)
  //   console.log('Sender: ', wallet.publicKey?.toBase58())

  //   let tx = new Transaction()
  //   const splTokenPk = new PublicKey(splToken)
  //   const bankPk = new PublicKey(bank)
  //   if (splToken != NATIVE_MINT.toBase58()) {
  //     // find ATA
  //     const destination = bankAta
  //     const source = await getAssociatedTokenAddress(splTokenPk, wallet.publicKey)

  //     console.log('Receiver ATA: ', destination)
  //     console.log('Sender ATA: ', source.toBase58())

  //     // send me money

  //     const ixSendMoney = createTransferInstruction(
  //       source,
  //       new PublicKey(destination),
  //       wallet.publicKey,
  //       cost
  //     )
  //     tx.add(ixSendMoney)
  //   } else {
  //     tx.add(
  //       SystemProgram.transfer({
  //         fromPubkey: wallet.publicKey,
  //         toPubkey: bankPk,
  //         lamports: cost
  //       })
  //     )
  //   }
  //   // get recent blockhash
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  //   // set whos paying for the tx
  //   tx.feePayer = wallet.publicKey!

  //   try {
  //     const signature = await wallet.sendTransaction(tx, connection)
  //     const latestBlockHash = await connection.getLatestBlockhash()
  //     await connection.confirmTransaction({
  //       blockhash: latestBlockHash.blockhash,
  //       lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //       signature
  //     })

  //     toast('Payment successful, minting edition...')
  //     console.log('calling new mint')
  //     try {
  //       const newMint = await fetch('api/mint', {
  //         body: JSON.stringify({
  //           signature: signature,
  //           address: wallet.publicKey.toBase58()
  //         }),
  //         headers: {
  //           'Content-Type': 'application/json; charset=utf8'
  //         },
  //         method: 'POST'
  //       })
  //       const repJson = await newMint.json()
  //       console.log(repJson)

  //       toast('Minting successful!')
  //       setLoading(false)
  //     } catch (e) {
  //       toast(
  //         'There was an error, please contact support with your payment transaction id'
  //       )
  //       setLoading(false)
  //       setError(true)
  //       setErrorMessage(signature)
  //     }
  //   } catch (e) {
  //     toast('Payment cancelled')
  //     console.log(e)
  //     setLoading(false)
  //   }
  // }



  useMemo(async () => {
    if (!wallet.publicKey) {
      return
    }
    // public key from the address you want to check the balance for
    const ownerPublicKey = new PublicKey(wallet.publicKey)

    // public key from the token contract address
    const tokenPublicKey = new PublicKey(splToken)

    let balance: any
    if (tokenPublicKey.toBase58() == NATIVE_MINT.toBase58()) {
      balance = await connection.getBalance(ownerPublicKey)
      console.log('bal: ', balance/LAMPORTS_PER_SOL)
      console.log(`token: ${tokenPublicKey.toBase58()} (${balance/LAMPORTS_PER_SOL})`)

      balance >= Number(cost * LAMPORTS_PER_SOL)
        ? setCanMint(true)
        : setCanMint(false)
    } else {
      balance = await connection.getParsedTokenAccountsByOwner(ownerPublicKey, {
        mint: tokenPublicKey
      })
      balance = balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount
      console.log(`token: ${tokenPublicKey.toBase58()} (${balance})`)
    

      balance >= Number(cost)
        ? setCanMint(true)
        : setCanMint(false)
    }

   
  }, [wallet.publicKey, connected])



  return (
    <div className='flex justify-center'>
        <div className='bg-white'>
          {!connected && (
            <div className='px-3 pt-2 pb-6 text-center'>
              <p className='mt-2 font-sans font-light text-slate-700'>
                Please connect your wallet.
              </p>
            </div>
          )}
          {connected && (
            <div className='px-3 pt-2 pb-6 text-center'>
              {/* <p className='mt-2 font-sans font-light text-slate-700'>
                It is your time to mint.
              </p> */}
              <Button
                loading={loading}
                disabled={!canMint}
                onClick={async ()=>{
                  setLoading(true)
                  await doIt(cost, splToken, bank, bankAta, index)
                  setLoading(false)
                }}
                className='w-48 px-3 py-3 mt-4 font-light border border-dashed rounded-lg border-slate-700 hover:bg-slate-700 hover:text-white'
              >
                {canMint
                  ? cost + ' ' + symbol
                  : `Need more $${symbol}`}
              </Button>
            </div>
          )}
        </div>
    </div>
  )
}
