export const imgopt = (url: string, width: number) => {
    if (!url) return ""
    const captureCid = /https:\/\/(.*).ipfs.dweb.*$/
    const captureCidArweave = /https:\/\/arweave.net\/(.*)/
    const cleanExt = /\?ext=(.*)/
    const replaceWidth = /\?width=400/
    const captureCidArweaveCache = /https:\/\/arweave.cache.holaplex.com\/(.*)/
    const captureCidIpfsIo = /https:\/\/ipfs.io\/ipfs\/(.*)/
    const captureCidOldHolaplexAssets = /https:\/\/images.holaplex.com\/(.*)/
  
    let cdnURI = url
      .replace(':443', '')
      .replace('www.', '')
      .replace(cleanExt, '')
      .replace(captureCid, 'https://assets.holaplex.tools/ipfs/$1')
      .replace(captureCidOldHolaplexAssets, 'https://assets.holaplex.tools/ipfs/$1')
      .replace(captureCidArweave, 'https://assets.holaplex.tools/arweave/$1')
      .replace(captureCidArweaveCache, 'https://assets.holaplex.tools/arweave/$1')
      .replace(captureCidIpfsIo, 'https://assets.holaplex.tools/ipfs/$1')
  
    if (cdnURI.includes('nftstorage.link')) {
      const parts = url.replace('https://nftstorage.link/ipfs/', '')
      const dsplit = parts.split('/')
      const cid = dsplit[0]
      dsplit.shift()
      cdnURI = `https://assets.holaplex.tools/ipfs/${cid}?width=${width}&path=${dsplit.join('/')}`
    }
  
    return cdnURI
  }