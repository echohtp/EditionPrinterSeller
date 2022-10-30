import { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Footer from '../components/Footer'
import Link from 'next/link'

const About: NextPage = () => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Head>
        <title>Open Editions - About</title>
        <meta name='description' content='Open Editions from 0xBanana and friends' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <main className={styles.main}>
      <h1 className='py-4 text-6xl font-extrabold tracking-tighter text-center transition-transform ease-in-out bg-transparent sm:leading-4 md:text-8xl text-gradient bg-clip-text'>
          Open Editions
        </h1>
        <div className='flex-none mt-4 h-14 w-102'>
        {/* <p className='py-1'>
            This is an experiment in custom minting open editions. 
        </p> */}
        <p className='py-1'>
            This is a living project that is <Link className='' href="https://github.com/echohtp/EditionPrinterSeller" target="_blank"><u>open source</u></Link>.
        </p>
        <p className='py-1'>
            Code is my art. 
        </p>
        <p className='pt-5'>
            If you&apos;d like to get your token or art listed, <Link href="https://twitter.com/0xbanana" target="_blank"><u>send me a DM</u></Link>.
        </p>
        </div>
    </main>
    <Footer/>
    </div>
  )
}

export default About
