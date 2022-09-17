import { useState } from 'react'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
  SystemProgram
} from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout
} from '@solana/spl-token'
import {
  MintNewEditionFromMasterEditionViaTokenArgs,
  createMintNewEditionFromMasterEditionViaTokenInstruction,
  MintNewEditionFromMasterEditionViaTokenInstructionAccounts,
  MintNewEditionFromMasterEditionViaTokenInstructionArgs
} from '@metaplex-foundation/mpl-token-metadata'
import { useMemo } from 'react'
import {
  COST,
  CUSTOM_TOKEN,
  BANK,
  ART_UPDATE_AUTHORITY,
  MASTER_EDITION_ADDRESS,
  EDITION_MARKER_BIT_SIZE
} from '../util/constants'

const Home: NextPage = () => {
  const { publicKey, signTransaction, connected, sendTransaction } = useWallet()
  const wallet = useWallet()
  const { connection } = useConnection()
  const [tokenBalance, setTokenBalance] = useState<number>(0)
  const [canMint, setCanMint] = useState<boolean>(false)

  const doIt = async () => {
    if (!publicKey) return

    console.log('Lets do the work')
    console.log('Cost: ', COST)
    console.log('SplToken: ', CUSTOM_TOKEN.toBase58())
    console.log('Reciever: ', BANK.toBase58())
    console.log('Sender: ', publicKey?.toBase58())

    // find empty edition to mint

    //


    let tx = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: publicKey,
        newAccountPubkey: publicKey,
        lamports: await connection.getMinimumBalanceForRentExemption(MintLayout.span),
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID
      })
    )
    // find ATA
    const destination = await getAssociatedTokenAddress(CUSTOM_TOKEN, BANK)
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

    const tokenAccount = await getAssociatedTokenAddress(
      MASTER_EDITION_ADDRESS,
      publicKey!
    )
    const tokenAccountOwner = publicKey
    const payer = publicKey
    const masterEdition = MASTER_EDITION_ADDRESS
    const newMintAuthority = publicKey
    const newMetadataUpdateAuthority = ART_UPDATE_AUTHORITY
    // newMetadata: web3.PublicKey; //newMetadata New Metadata key (pda of ['metadata', program id, mint id])
    // newEdition: web3.PublicKey; //newEdition New Edition (pda of ['metadata', program id, mint id, 'edition'])
    // newMint: web3.PublicKey; //newMint Mint of new token - THIS WILL TRANSFER AUTHORITY AWAY FROM THIS KEY
    // editionMarkPda: web3.PublicKey; // will be checked for pre-existence. (pda of ['metadata', program id, master metadata mint id, 'edition', edition_number]) where edition_number is NOT the edition number you pass in args but actually edition_number = floor(edition/EDITION_MARKER_BIT_SIZE).
    // metadata: web3.PublicKey; //
    // tokenProgram?: web3.PublicKey;
    // systemProgram?: web3.PublicKey;
    // rent?: web3.PublicKey;
    // https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#MintNewEditionFromMasterEditionViaTokenInstructionAccounts
    const ixAccounts: MintNewEditionFromMasterEditionViaTokenInstructionAccounts = {
      masterEdition,
      payer,
      tokenAccountOwner,
      tokenAccount,
      newMintAuthority,
      newMetadataUpdateAuthority
    }

    // https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#MintNewEditionFromMasterEditionViaTokenArgs
    const mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaTokenArgs = {
      edition: 1
    }

    // https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#MintNewEditionFromMasterEditionViaTokenInstructionArgs
    const ixTokenArgs: MintNewEditionFromMasterEditionViaTokenInstructionArgs = {
      mintNewEditionFromMasterEditionViaTokenArgs
    }
    
    // https://metaplex-foundation.github.io/metaplex-program-library/docs/token-metadata/index.html#createMintNewEditionFromMasterEditionViaTokenInstruction
    const ixMint = createMintNewEditionFromMasterEditionViaTokenInstruction(
      ixAccounts,
      ixTokenArgs
    )

    tx.add(ixSendMoney)
    tx.add(ixMint)

    // get recent blockhash
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    // set whos paying for the tx
    tx.feePayer = publicKey!

    const signature = await sendTransaction(tx, connection)
    const latestBlockHash = await connection.getLatestBlockhash()
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature
    })
  }

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
    tokenBalance > COST ? setCanMint(true) : setCanMint(false)
  }, [publicKey])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <WalletMultiButton />
      <main className={styles.main}>
        {!connected && <h1>Please connect wallet</h1>}
        {connected && (
          <button disabled={!canMint} onClick={doIt}>
            {canMint ? 'Mint me' : 'Need more tokens'}
          </button>
        )}
      </main>

      <footer className={styles.footer}>
        <h1>Made with ❤️ by 🍌</h1>
      </footer>
    </div>
  )
}

export default Home
