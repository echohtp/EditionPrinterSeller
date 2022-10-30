import '../styles/globals.css'
import { AppProps } from 'next/app'
import React, { FC, useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  LedgerWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
  TorusWalletAdapter
} from '@solana/wallet-adapter-wallets'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import 'tailwindcss/tailwind.css'
import { ToastContainer } from 'react-toastify'
import {themeChange} from 'theme-change'

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')
import 'react-toastify/dist/ReactToastify.css'
import 'react-image-lightbox/style.css'

function MyApp ({ Component, pageProps }: AppProps) {
  const themeValues = [
    "cupcake",
    "Bumblebee",
    "Aqua",
    "dark"

  ]

  useEffect(()=>{
    themeChange(false)
  });

  const router = useRouter()
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  // update this to https://ssc-dao.genesysgo.net
  const network = WalletAdapterNetwork.Mainnet

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_RPC!, [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new SolletWalletAdapter({ network }),
      new SolletExtensionWalletAdapter({ network })
    ],
    [network]
  )

  return (
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <ToastContainer />
            {/* <select className="text-primary" data-choose-theme>
              <option className="text-primary" value={"cupcake"}>Default Value</option>
              {themeValues.map((value)=>
                <option className="text-primary" key={value.toLowerCase()} value={value.toLowerCase()}>{value}</option>
              )}
            </select> */}
            <Component {...pageProps} />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
  )
}

export default MyApp
