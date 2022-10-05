import { Button } from 'antd'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
export interface EditionProps {
  connected: boolean
  loading: boolean
  canMint: boolean
  cost: number
  symbol: string
  doIt: any
}

export const Edition = (props: EditionProps) => {
  const { connected, loading, canMint, cost, symbol, doIt } = props
  return (
    <div className='flex justify-center pt-5'>
      <a className='inline-block max-w-xs overflow-hidden transition duration-300 ease-in-out shadow-xl cursor-pointer rounded-3xl hover:-translate-y-1 hover:scale-102 max-h-xs'>
        <div className='relative w-full overflow-hidden bg-black group rounded-t-3xl'>
          <img
            src='https://arweave.net/7arD7-TFT98uGlJuw7W_2ZAonWMlAh2Jh1xTm5cu2J4?ext=jpg'
            className='object-cover w-full h-full duration-700 transform backdrop-opacity-100'
          />
          {/* <div className='absolute flex items-end justify-center w-full h-full bg-gradient-to-t from-black -inset-y-0'>
      <h1 className='mb-2 text-2xl font-bold text-white'>
        MonkeDAO
      </h1>
    </div> */}
        </div>
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
              <p className='mt-2 font-sans font-light text-slate-700'>
                It is your time to mint.
              </p>
              <Button
                loading={loading}
                disabled={!canMint}
                onClick={doIt}
                className='w-32 px-3 py-3 mt-4 font-light border border-dashed rounded-lg border-slate-700 hover:bg-slate-700 hover:text-white'
              >
                {canMint
                  ? cost / LAMPORTS_PER_SOL + ' ' + symbol
                  : 'Need more tokens'}
              </Button>
            </div>
          )}
        </div>
      </a>
    </div>
  )
}
