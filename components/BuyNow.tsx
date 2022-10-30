import { Button } from 'antd'
import { priceTag } from './edition'
import { useMemo, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Connection, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NATIVE_MINT } from '@solana/spl-token'

interface BuyNowInterface {
  priceTag: priceTag[]
  index: number
  editionIndex: number
  doIt: any
}

const BuyNow = (props: BuyNowInterface) => {
  const { priceTag, index, doIt, editionIndex } = props
  const wallet = useWallet()
  const [splMints, setSplMints] = useState<string[]>(
    priceTag.map(p => p.splToken)
  )
  const [prices, setPrices] = useState<number[]>(priceTag.map(p => p.price))
  const [balances, setBalances] = useState<number[]>(
    Array(priceTag.length).fill(0)
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [canMint, setCanMint] = useState<boolean>(false)
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC!)

  // get wallet balances
  useMemo(async () => {
    if (loading) return
    let _balances = []
    for (var i = 0; i < splMints.length; i++) {
      if (!wallet.publicKey) {
        return
      }
      // public key from the address you want to check the balance for
      const ownerPublicKey = new PublicKey(wallet.publicKey)

      // public key from the token contract address
      const tokenPublicKey = new PublicKey(splMints[i])

      let balance: any
      if (tokenPublicKey.toBase58() == NATIVE_MINT.toBase58()) {
        balance = await connection.getBalance(ownerPublicKey)
        _balances.push(balance / LAMPORTS_PER_SOL)
        console.log(`Solana balance: (${balance / LAMPORTS_PER_SOL})`)
      } else {
        balance = await connection.getParsedTokenAccountsByOwner(
          ownerPublicKey,
          {
            mint: tokenPublicKey
          }
        )
        balance =
          balance.value[0]?.account.data.parsed.info.tokenAmount.uiAmount
        _balances.push(balance)
        console.log(`token: ${priceTag[i].symbol} (${balance})`)
      }
    }
    setBalances(_balances)
  }, [wallet.connected, splMints, loading])

  // check if wallet have enough to mint
  useMemo(() => {
    let _canMint = true
    for (var i = 0; i < balances.length; i++) {
      console.log('canmint check->')
      console.log('balance: ', Number(balances[i]))
      console.log('price: ', prices[i])

      console.log(Number(balances[i]) >= prices[i])

      _canMint = _canMint && Number(balances[i]) >= prices[i]
    }
    setCanMint(_canMint)
  }, [wallet.connected, prices, balances])


  return (
    <div className='w-full'>
      <div className='w-full'>
        <Button
      
          id={`buyNow-${editionIndex}-${index}`}
          onClick={async () => {
            if (!canMint) return
            console.log("do it nowww")
            setLoading(true)
            await doIt(priceTag, editionIndex)
            setLoading(false)
          }}
          // loading={loading}
        //   disabled={!canMint}
          onMouseEnter={e => {
            
            canMint
            //@ts-ignore
              ? (document.getElementById(`buyNow-${editionIndex}-${index}`).textContent = '🚀')
            //@ts-ignore
              : (document.getElementById(`buyNow-${editionIndex}-${index}`).textContent =
                  'Need more tokens')
          }}
          onMouseLeave={() => {
            //@ts-ignore
            document.getElementById(`buyNow-${editionIndex}-${index}`).textContent = priceTag
              .map(pt => `${pt.price} ${pt.symbol} & `)
              .join('')
              .slice(0, -2)
          }}
          className={`px-1 py-2 font-light border border-dashed rounded-lg w-full text-sm ${canMint &&
            'hover:bg-green-100 hover:text-white bg-green-200 border-green-700'} ${!canMint &&
            'hover:bg-red-100 hover:cursor-not-allowed hover:text-black bg-red-200 border-red-700'} `}
        >
          {priceTag
            .map(pt => `${pt.price} ${pt.symbol} & `)
            .join('')
            .slice(0, -2)}
        </Button>
      </div>
    </div>
  )
}

export default BuyNow
