// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { NextApiRequest, NextApiResponse } from 'next'
import { Metaplex, keypairIdentity } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

const nftAddress = process.env.NEXT_PUBLIC_NFT!

const MASTER_EDITION_ADDRESS = new PublicKey(
  nftAddress // nft to print here
)

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

  console.log(req.body)

//   // // verify the tx
//   let txResult 
//   for (var i = 0; i < 3; i++) {
//     txResult = await connection.getTransaction(req.body.signature, {
//       commitment: 'confirmed',
//       maxSupportedTransactionVersion: 0
//     })
//     console.log(txResult)
//   }
//   // // TX WASNT GOOD BAIL
//   if (!txResult) res.status(200).json({ error: 'tx no good' })

  // load wallet from env
  const SK = process.env.SK!
  const SKua = bs58.decode(SK)
  const keypair = Keypair.fromSecretKey(SKua)
  const metaplex = new Metaplex(connection).use(keypairIdentity(keypair))

  // load the master edition to
  const nft = await metaplex
    .nfts()
    .findByMint({ mintAddress: MASTER_EDITION_ADDRESS })
    .run()
  const newOwner = new PublicKey(req.body.address)
  if (nft.model == 'nft') {
    const newNft = await metaplex
      .nfts()
      .printNewEdition({
        originalMint: MASTER_EDITION_ADDRESS,
        newOwner: newOwner
      })
      .run()
    res.status(200).json({ acct: newNft.tokenAddress.toBase58() })
  }
}
