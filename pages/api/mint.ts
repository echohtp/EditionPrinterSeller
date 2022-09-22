// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {Metaplex, keypairIdentity} from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import {Keypair} from '@solana/web3.js'
import bs58 from 'bs58'
import { MASTER_EDITION_ADDRESS } from '../../util/constants'

type Data = {
  name: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

    if (req.method != "POST") return 

    if (!req.body.signature || !req.body.address) return 

    // const connection = new Connection('https://ssc-dao.genesysgo.net')

    // // verify the tx 
    // const txResult = await connection.getTransaction(signature, {commitment: "finalized", maxSupportedTransactionVersion: 0 })

    // // TX WASNT GOOD BAIL
    // if (!txResult) return 


    // // load wallet from env 
    // const SK = process.env.SK!
    // const SKua = bs58.decode(SK)
    // const keypair = Keypair.fromSecretKey(SKua)
    // const metaplex = new Metaplex(connection).use(keypairIdentity(keypair))

    // // load the master edition to 
    // const nft = await metaplex.nfts().findByMint({mintAddress: MASTER_EDITION_ADDRESS}).run()
    // const newOwner = new PublicKey("")
    // if (nft.model == "nft"){
    //     const newNft =  await metaplex.nfts().printNewEdition({originalMint: MASTER_EDITION_ADDRESS, newOwner: newOwner}).run()
    // }

    res.status(200).json({ name: '' })
}
