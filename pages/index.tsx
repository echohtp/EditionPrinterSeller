import { useState } from 'react'
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { createTransferInstruction, getAssociatedTokenAddress } from '@solana/spl-token'
import {
  MintNewEditionFromMasterEditionViaTokenArgs,
  createMintNewEditionFromMasterEditionViaTokenInstruction,
  MintNewEditionFromMasterEditionViaTokenInstructionAccounts,
  MintNewEditionFromMasterEditionViaTokenInstructionArgs
} from '@metaplex-foundation/mpl-token-metadata'
import { useMemo } from 'react'

const TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'
)

const CUSTOM_TOKEN: PublicKey = new PublicKey(
  '6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce' // Bnon token
)

const BANK: PublicKey = new PublicKey(
  '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC'
)

const ART_UPDATE_AUTHORITY: PublicKey = new PublicKey(
  '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC'
)

const MASTER_EDITION_ADDRESS = new PublicKey(
  '28BpDQ1BrwbrQtEimBoh5CX7i2WnwwNZ9yQG5L6V2adw'  // nft to print here
)

const COST: number = 100 * LAMPORTS_PER_SOL // put token decimals here or you will have a problem

async function findAssociatedTokenAddress (
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer()
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0]
}

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

    let tx = new Transaction()
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

      const tokenAccount = await getAssociatedTokenAddress(MASTER_EDITION_ADDRESS, publicKey! )
      const tokenAccountOwner = publicKey 
      const payer = publicKey
      const masterEdition = MASTER_EDITION_ADDRESS
      const newMintAuthority = ART_UPDATE_AUTHORITY
      const newMetadataUpdateAuthority = ART_UPDATE_AUTHORITY
    // newMetadata: web3.PublicKey;
    // newEdition: web3.PublicKey;
    // newMint: web3.PublicKey;
    // editionMarkPda: web3.PublicKey;
    // metadata: web3.PublicKey;
    // tokenProgram?: web3.PublicKey;
    // systemProgram?: web3.PublicKey;
    // rent?: web3.PublicKey;
    const ixAccounts: MintNewEditionFromMasterEditionViaTokenInstructionAccounts = {
     masterEdition,
     payer,
     tokenAccountOwner,
     tokenAccount, 

     
    }

    const mintNewEditionFromMasterEditionViaTokenArgs: MintNewEditionFromMasterEditionViaTokenArgs = {
      edition: 1
    }
    const ixTokenArgs: MintNewEditionFromMasterEditionViaTokenInstructionArgs = {
      mintNewEditionFromMasterEditionViaTokenArgs
    }

    const ixMint = createMintNewEditionFromMasterEditionViaTokenInstruction(
      ixAccounts,
      ixTokenArgs
    )

    tx.add(ixSendMoney)
    // tx.add(ixMint)

    // COPY

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
    console.log("Token balance: ", tokenBalance);
    (tokenBalance > COST) ? setCanMint(true) : setCanMint(false)
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
        {connected && <button disabled={!canMint} onClick={doIt}>{ (canMint) ? "Mint me" : "Need more tokens" }</button>}
      </main>

      <footer className={styles.footer}>
      <h1>Made with ❤️ by 🍌</h1>
      </footer>
    </div>
  )
}

export default Home
