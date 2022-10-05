// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { Metaplex, keypairIdentity, logTrace } from '@metaplex-foundation/js'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'
import { CUSTOM_TOKEN } from '../../util/constants'
import { NATIVE_MINT } from '@solana/spl-token'

const nftAddress = process.env.NEXT_PUBLIC_NFT!
const PRICE = process.env.NEXT_PUBLIC_PRICE
const MASTER_EDITION_ADDRESS = new PublicKey(
  nftAddress // nft to print here
)

const BANK_ATA: PublicKey = new PublicKey(process.env.NEXT_PUBLIC_BANK_ATA!)

type Data = {
  acct?: string
  error?: string
}

export default async function handler (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method != 'POST') return

  if (!req.body.signature || !req.body.address) return

  const connection = new Connection('https://ssc-dao.genesysgo.net')
  const slot = await connection.getSlot()
  console.log(req.body)

  // // verify the tx
  console.log('verifying tx')

  let txResult = null
  let max = 3
  let i = 0
  do {
    txResult = await connection.getTransaction(req.body.signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    })
    if (txResult != null) break
  } while (i < max)

  if (txResult == null) {
    console.log('couldnt confirm the tx')
    console.log('txresult: ', txResult)
    return res.status(200).send({ error: 'couldnt confirm tx' })
  }

  console.log('loaded tx')

  // check against slot
  console.log('checking slot')

  if (slot - 50 > txResult!.slot) res.status(200).send({ error: 'old tx' })
  console.log('slot ok')

  console.log('checking paid amount')

  const t1 =
  txResult!.meta?.postTokenBalances?.at(1)?.uiTokenAmount.uiAmount || txResult!.meta?.postBalances?.at(1)
    
  const t0 =
  txResult!.meta?.preTokenBalances?.at(1)?.uiTokenAmount.uiAmount || txResult!.meta?.preBalances?.at(1)
    
  console.log(t0, t1)

  console.log('t0: ', t0)
  console.log('t1: ', t1)
  console.log('diff: ', Number(Number(t1! - t0!).toPrecision(2)))
  console.log(PRICE)

  if (Number(t1! - t0!) != Number(PRICE) * LAMPORTS_PER_SOL)
    return res.status(200).send({ error: 'bad till' })

  console.log('correct payment')
  console.log('checking keys')

  const acctKeys = txResult?.transaction.message.getAccountKeys()
  const sender = acctKeys?.get(0)?.toBase58()
  const reciever = acctKeys?.get(1)

  if (sender != req.body.address && reciever != BANK_ATA)
    return res.status(200).send({ error: 'bad accts' })

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
    .findByMint({ mintAddress: MASTER_EDITION_ADDRESS })
    .run()
  console.log('we found the nft')
  console.log(nft.name)

  const newOwner = new PublicKey(req.body.address)
  console.log('printing')
  try {
  const newNft = await metaplex
    .nfts()
    .printNewEdition({
      originalMint: MASTER_EDITION_ADDRESS,
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
    return res.status(200).send({ error: "Printing failed, you have been refunded!" })
  }
}
