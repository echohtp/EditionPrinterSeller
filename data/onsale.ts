import { NATIVE_MINT } from "@solana/spl-token"

const mintsOnSale = [
  {
    splToken: '6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce',
    bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
    bankAta: '437mKN7wtYVkH8cUgDR4Lyi4bfUyWnChvh62Nk6y8yix',
    price: 75,
    symbol: 'BNON',
    mint: 'BvCAdmPA8xuz1Cx3H3Fo6fF8GHji2Evwv6DB1X9szicj',
    image: 'https://assets1.holaplex.tools/ipfs/bafybeiatemwoesf43eqzdieojhrdxl6pgbdhnpi2llkzmq3hn3n2tibh24'
  },
  {
    splToken: NATIVE_MINT.toBase58(),
    bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
    bankAta: '',
    price: 1.69,
    symbol: 'SOL',
    mint: 'BvCAdmPA8xuz1Cx3H3Fo6fF8GHji2Evwv6DB1X9szicj',
    image: 'https://assets1.holaplex.tools/ipfs/bafybeiatemwoesf43eqzdieojhrdxl6pgbdhnpi2llkzmq3hn3n2tibh24'
  }
]

export default mintsOnSale
