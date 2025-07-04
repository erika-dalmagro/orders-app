import { useEffect, useState } from "react"
import axios from "axios"

type Product = {
  id: number
  name: string
  price: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")

  useEffect(() => {
    axios.get("http://localhost:8080/products")
      .then(res => setProducts(res.data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await axios.post("http://localhost:8080/products", {
      name,
      price: parseFloat(price)
    })

    setName("")
    setPrice("")

    const res = await axios.get("http://localhost:8080/products")
    
    setProducts(res.data)
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Product List</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input className="border p-2 mr-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="border p-2 mr-2" placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <button className="bg-blue-500 text-white px-4 py-2 rounded" type="submit">Add</button>
      </form>

      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} - ${p.price.toFixed(2)}</li>
        ))}
      </ul>
    </div>
  )
}

export default App
