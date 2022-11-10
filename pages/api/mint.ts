// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { Metaplex, keypairIdentity, logTrace } from '@metaplex-foundation/js'
import { Connection, LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import mintsOnSale from '../../data/onsale'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT
} from '@solana/spl-token'

type Data = {
  acct?: string
  error?: string
}

const verifyTx = async(connection: Connection, signature: string) => {
  console.log('verifying tx')

  let txResult = null
  let max = 3
  let i = 0
  do {
    txResult = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    if (txResult != null) break
  } while (i < max)

  return (txResult)
}

const verifyTill = () => {}

const verifyAccounts = () => {}

const refund = () => {}



export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  console.log("=======event======");
  console.log(req.body)

  if (req.method != 'POST') {
    console.log("Not a post request")
    return  res.status(200).send({ error: 'Not a post request' })
  }

  const paramters = Object.keys(req.body)

  if (!paramters.includes("signature") || !paramters.includes("address") || !paramters.includes("index") || !paramters.includes("receiver")) {
    console.log("Missing paramters");
    return res.status(200).send({ error: 'Missing parameters' })
  }


  const saleItem = mintsOnSale[req.body.index]


  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!)
  const slot = await connection.getSlot()
  
  // // verify the tx
  const txResult = await verifyTx(connection, req.body.signature)
  if (!txResult) return res.status(200).send({ error: 'couldnt confirm tx' })

  console.log('loaded tx')

  // check against slot
  console.log('checking slot')

  if (slot - 100 > txResult.slot) res.status(200).send({ error: 'old tx' })
  console.log('slot ok')

  // console.log('checking paid amount')

  // const t1 =
  // txResult!.meta?.postTokenBalances?.at(1)?.uiTokenAmount.uiAmount || txResult!.meta?.postBalances?.at(1)
    
  // const t0 =
  // txResult!.meta?.preTokenBalances?.at(1)?.uiTokenAmount.uiAmount || txResult!.meta?.preBalances?.at(1)
    
  // console.log(t0, t1)

  // console.log('t0: ', t0)
  // console.log('t1: ', t1)
  // console.log('diff: ', Math.abs(Number(Number(t1! - t0!).toPrecision(2))))
  // console.log(Math.abs(Number(mintsOnSale[req.body.index].price * LAMPORTS_PER_SOL)))

  // if (Math.abs(Number(Number(t1! - t0!).toPrecision(2))) != Math.abs(Number(mintsOnSale[req.body.index].price * LAMPORTS_PER_SOL)))
  //   return res.status(200).send({ error: 'bad till' })

  // console.log('correct payment')
  console.log('checking keys')

  // const acctKeys = txResult?.transaction.message.getAccountKeys()
  // const sender = acctKeys?.get(0)?.toBase58()
  // const reciever = acctKeys?.get(1)

  //if (sender != req.body.address && (reciever?.toBase58() != mintsOnSale[req.body.index].bank || reciever?.toBase58() != mintsOnSale[req.body.index].bankAta))
    //return res.status(200).send({ error: 'bad accts' })

  console.log('accounts are good')

  // load wallet from env
  const SK = process.env.SK!
  const SKua = bs58.decode(SK)
  const keypair = Keypair.fromSecretKey(SKua)
  const metaplex = new Metaplex(connection).use(keypairIdentity(keypair))

  // load the master edition to
  console.log('loading the nft')

  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(saleItem.mint) })
    .run()
  console.log('we found the nft')
  console.log(nft.name)

  const newOwner = new PublicKey(req.body.address)
  console.log('printing')
  try {
  const newNft = await metaplex
    .nfts()
    .printNewEdition({
      originalMint: new PublicKey(saleItem.mint),
      newOwner: newOwner
    })
    .run()
  console.log('printed!')
  return res.status(200).send({ acct: newNft.tokenAddress.toBase58() })
  }catch(e:any){
    // metaplex print failed
    // process refunds here
    // possible reasons: 
    // at NFT Supply limit
    // ...?
    res.status(200).send({ error: "Printing failed, please contact support!" })
  //   const tx = new Transaction()
  //   const source = mintsOnSale[req.body.index].bankAta
  //   const receiver = req.body.receiver
    
  //   // return funds to user
  //   if ( mintsOnSale[req.body.index].mint != NATIVE_MINT.toBase58()) {
  //     const ixSendMoney = createTransferInstruction(
  //       new PublicKey(source),
  //       new PublicKey(receiver),
  //       keypair.publicKey,
  //       mintsOnSale[req.body.index].price * LAMPORTS_PER_SOL
  //     )
  //     tx.add(ixSendMoney)
  //   } else {
  //     tx.add(
  //       SystemProgram.transfer({
  //         fromPubkey: keypair.publicKey,
  //         toPubkey: new PublicKey(receiver),
  //         lamports: mintsOnSale[req.body.index].price * LAMPORTS_PER_SOL
  //       })
  //     )
  //   }
  //   // get recent blockhash
  //   tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

  //   // set whos paying for the tx
  //   tx.feePayer = keypair.publicKey

  //   try {
  //     const signature = await connection.sendTransaction(tx, [keypair])
  //     const latestBlockHash = await connection.getLatestBlockhash()
  //     await connection.confirmTransaction({
  //       blockhash: latestBlockHash.blockhash,
  //       lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
  //       signature
  //     })
  //   }catch{
  //     console.log('couldnt refund user')
  //     console.log(req.body);
  //   }
  }
}
