import {
    LAMPORTS_PER_SOL,
    PublicKey,
  } from '@solana/web3.js'

  
  export const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  );


  export const CUSTOM_TOKEN: PublicKey = new PublicKey(
    '6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce' // Bnon token
  )
  
  export const BANK: PublicKey = new PublicKey(
    '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC'
  )
  
  export const ART_UPDATE_AUTHORITY: PublicKey = new PublicKey(
    'DmwHBt9RS9QZesz2k6NsiC9CXCvgaGSTWycWj8nCdkC6' // Art Update Authority
  )
  
  export const MASTER_EDITION_ADDRESS = new PublicKey(
    '28BpDQ1BrwbrQtEimBoh5CX7i2WnwwNZ9yQG5L6V2adw'  // nft to print here
  )
  
  export const PRICE = 100
  export const COST: number = PRICE * LAMPORTS_PER_SOL // put token decimals here or you will have a problem

  export const EDITION_MARKER_BIT_SIZE = 248;