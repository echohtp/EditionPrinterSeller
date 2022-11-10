import { NATIVE_MINT } from '@solana/spl-token'

// const mintsOnSale = []
const mintsOnSale = [
  {
    creator: "0xBanana",
    open: true,
    //mint: '72NP5yHK5mA7QRJNCuvdDSFbHVSddUTVEkCuCi2JjY51', // polymorphism
    mint: 'GLE8YHQ2DFPgBPH977VRTiXs5A2vaQoAAEvPqsVmKNWx', // flowerdao
    priceTags: [
      [
        {
          splToken: "6a6bpRFhujDp772G6EchpiDBBYbivNygwJLttDSiqpce",
          bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
          bankAta: '437mKN7wtYVkH8cUgDR4Lyi4bfUyWnChvh62Nk6y8yix',
          price: 100,
          symbol: '$BNON'
        },
        {
          splToken: NATIVE_MINT.toBase58(),
          bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
          bankAta: '',
          price: 0.2,
          symbol: 'SOL'
        }
      ],
      [
        {
          splToken: "BDNRJZ6MA3YRhHcewYMjRDEc7oWQCxHknXU98wwTsSxu",
          bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
          bankAta: '7eCk9QGWqe1aPaeh3czADgKoce9ww8mEo32D3DBCqpos',
          price: 100,
          symbol: '$OOO'
        },
        {
          splToken: NATIVE_MINT.toBase58(),
          bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
          bankAta: '',
          price: 0.33,
          symbol: 'SOL'
        },
      ],
      [
        
        {
          splToken: NATIVE_MINT.toBase58(),
          bank: '232PpcrPc6Kz7geafvbRzt5HnHP4kX88yvzUCN69WXQC',
          bankAta: '',
          price: 1.69,
          symbol: 'SOL'
        },
      ]
    ]
  }
]

export default mintsOnSale
