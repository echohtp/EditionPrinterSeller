import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { Metaplex, Nft, Metadata } from '@metaplex-foundation/js'
import {
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  Connection
} from '@solana/web3.js'

const NftPage: NextPage = () => {
  const [nft, setNft] = useState<Nft | null>(null)
  const router = useRouter()
  const { mint } = router.query
  console.log(mint)

  useMemo(async () => {
    if (mint) {
      const connection = new Connection('https://ssc-dao.genesysgo.net')
      const metaplex = new Metaplex(connection)
      const nft = await metaplex
        .nfts()
        .findByMint({ mintAddress: new PublicKey(mint!) })
        .run()
      if (nft.model == 'nft') {
        setNft(nft)
      }
    }
  }, [mint])

  return (
    <>
      {nft == null && (
        <>
          <h1>Mint hash not supplied</h1>
        </>
      )}
      {nft != null && (
        <>
          <h1>{nft.name}</h1>
          <h3>{nft.json?.description}</h3>
          <img height={400} width={400}  src={nft.json?.image}/>
        </>
      )}
    </>
  )
}

export default NftPage
