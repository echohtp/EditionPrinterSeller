/* eslint-disable @next/next/no-img-element */
import { useState } from 'react'
import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
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
  EDITION_MARKER_BIT_SIZE,
  PRICE
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

    let tx = new Transaction()

    // find ATA
    const destination = await getAssociatedTokenAddress(CUSTOM_TOKEN, BANK)
    const source = await getAssociatedTokenAddress(CUSTOM_TOKEN, publicKey!)

    console.log('Receiver ATA: ', destination.toBase58())
    console.log('Sender ATA: ', source.toBase58())

    // Pay for the edition
    const ixSendMoney = createTransferInstruction(
      source,
      destination,
      publicKey!,
      COST
    )

    //👇🏽 THIS IS WHERE HELP IS NEEDED

    // I saw this in the question below and im not sure why an account was created
    // https://solana.stackexchange.com/questions/1758/different-errors-by-mint-new-edition-from-master-edition
    // tx.add(
    //   SystemProgram.createAccount({
    //     fromPubkey: publicKey,
    //     newAccountPubkey: publicKey,
    //     lamports: await connection.getMinimumBalanceForRentExemption(
    //       MintLayout.span
    //     ),
    //     space: MintLayout.span,
    //     programId: TOKEN_PROGRAM_ID,
    //   })
    // )


    // ALL OF THESE VARIABLES GO INTO ixAccounts 
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

    //👆🏽 Go back up and make sure all the accounts are set correctly

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
    ;(tokenBalance as number) > PRICE ? setCanMint(true) : setCanMint(false)
  }, [publicKey])

  return (
    <div className='flex flex-col min-h-screen'>
      <Head>
        <title>Edition Printer</title>
        <meta name='description' content='Edition' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
        <WalletMultiButton />

        <h1 className='font-extrabold tracking-tighter text-center transition-transform ease-in-out bg-transparent sm:leading-4 text-7xl md:text-9xl text-gradient bg-clip-text animated hover:scale-105 hover:skew-y-6 hover:-skew-x-6'>
          Edition Printer
        </h1>
        <div className='relative flex flex-col items-center justify-center w-full py-8 overflow-hidden sm:py-12 lg:pb-8'>
          <div className='flex flex-col items-center pb-5'>
            <h2 className='text-lg font-extrabold tracking-wider text-center uppercase sm:text-2xl font-plex'>
              <span className='pb-1 sm:pb-2 whitespace-nowrap'>
                open edition mints
              </span>
            </h2>
          </div>
          <div className='flex justify-center pt-5'>
            <a className='rounded-3xl inline-block overflow-hidden shadow-xl max-w-xs cursor-pointer transition ease-in-out hover:-translate-y-1 hover:scale-102 duration-300 max-h-xs'>
              <div className='relative group w-full overflow-hidden bg-black rounded-t-3xl'>
                <img
                  src='/infinity.png'
                  className='object-cover w-full h-full transform duration-700 backdrop-opacity-100'
                />
                {/* <div className='absolute bg-gradient-to-t from-black w-full h-full flex items-end justify-center -inset-y-0'>
                  <h1 className='font-bold text-2xl text-white mb-2'>
                    MonkeDAO
                  </h1>
                </div> */}
              </div>
              <div className='bg-white'>
                {!connected && (
                  <div className='text-center px-3 pb-6 pt-2'>
                    <p className='mt-2 font-sans font-light text-slate-700'>
                      Please connect your wallet.
                    </p>
                  </div>
                )}
                {connected && (
                  <div className='text-center px-3 pb-6 pt-2'>
                    <p className='mt-2 font-sans font-light text-slate-700'>
                      It is your time to mint.
                    </p>
                    <button
                      disabled={!canMint}
                      onClick={doIt}
                      className='pt-3 btn btn-primary'
                    >
                      {canMint ? 'Mint me' : 'Need more tokens'}
                    </button>
                  </div>
                )}
              </div>
            </a>
          </div>
        </div>
      </main>

      <footer>
        <div
          className='text-center p-4'
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.1);' }}
        >
          Made with ❤️
        </div>
      </footer>
    </div>
  )
}

export default Home
