import Link from "next/link"

const Footer = () => {
    return (
        <footer className="flex" style={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div className='p-4 text-center'>
          Made with ❤️ by{' '}
          <a href='https://twitter.com/0xbanana' target='_blank'>
            0xBanana
          </a>
        </div>
        <div className='flex flex-1 p-4 text-center'>
          <div className='px-2'>
            <Link href="/">Home</Link>
          </div>
          <div className='px-2'>
            <Link href="/about">About</Link>
          </div>
        </div>
      </footer>
    )
}

export default Footer