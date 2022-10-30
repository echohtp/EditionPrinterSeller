import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  NATIVE_MINT
} from '@solana/spl-token'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { useMemo } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'
import { useState } from 'react'
import Lightbox from 'react-image-lightbox'
import { Transaction } from '@solana/web3.js'
import { LAMPORTS_PER_SOL, SystemProgram } from '@solana/web3.js'
import BuyNow from './BuyNow'

// feature flags
const LinkToCreator = false
export interface priceTag {
  splToken: string
  bank: string
  bankAta: string | null
  price: number
  symbol: string
}
export interface EditionProps {
  connected: boolean
  canMint: boolean
  doIt: void
  image: string
  index: number
  priceTags: priceTag[][]
  name: string
  description: string
  creator: string
}

export const Edition = (props: EditionProps) => {
  const {
    connected,
    priceTags,
    doIt,
    index,
    image,
    name,
    description,
    creator
  } = props
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <div className='flex justify-center pt-5'>
      <a className='inline-block overflow-hidden transition duration-300 ease-in-out shadow-xl cursor-pointer rounded-3xl max-h-xs'>
        <div className='relative w-full overflow-hidden bg-black group rounded-t-3xl'>
          {isOpen && (
            <Lightbox
              mainSrc={image}
              onCloseRequest={() => setIsOpen(false)}
              imageTitle={
                name + ' -----> Press the (+) button if the image doesnt load'
              }
              imageCaption={description}
            />
          )}
          <img
            src={image}
            className='object-cover duration-700 transform backdrop-opacity-100'
            onClick={() => setIsOpen(true)}
          />
        </div>
        <div className='bg-white'>
          <div className='px-3'>
            <div className='px-3'>
              <p className='py-2 text-2xl'>
                {name} <small className='text-sm'>{creator}</small>
              </p>
              <p className='pb-2'>
                <i>{description}</i>
              </p>

              {LinkToCreator ? (
                <Link href={`/${creator}`}>
                  <div className='items-center avatar'>
                    <div className='w-8 rounded-full'>
                      <img
                        src={`https://market.holaplex.com/images/gradients/gradient-${0 +
                          1}.png`}
                      />
                    </div>
                    <p className='pl-2'>0xBanana</p>
                  </div>
                </Link>
              ) : (
                <></>
              )}
            </div>

            <div className='flex justify-center'>
              <div className='bg-white'>
                {!connected && (
                  <div className='px-3 pt-2 pb-6 text-center'>
                    <p className='mt-2 font-sans font-light text-slate-700'>
                      Connect wallet to mint.
                    </p>
                  </div>
                )}
                {connected && (
                  <div className='px-3 pt-2 pb-6 mx-4 text-center'>
                    {priceTags.map((tag: priceTag[], idx: number) => (
                      <div className=''>
                        <BuyNow
                          priceTag={tag}
                          index={idx}
                          editionIndex={index}
                          doIt={doIt}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}
