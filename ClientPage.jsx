import React, { useState } from 'react';

// Pagina Cliente - Preventivo (React + Tailwind)
// Export default component. Integrare successivamente con Supabase per leggere/scrivere dati.
// Note: aggiungi questo file in src/pages/ClientPage.jsx oppure come componente nella tua PWA.

export default function ClientQuotePage() {
  const [selectedCategory, setSelectedCategory] = useState('goccia');
  const [quantity, setQuantity] = useState(2);
  const [components, setComponents] = useState({ completo: false, soloBandiera: true, soloAsta: false, soloBase: false, zavorra: false });
  const [uploads, setUploads] = useState([]); // {id, name, url}
  const [cartItems, setCartItems] = useState([{
    id: 'bandiera-1',
    title: 'Bandiera Goccia Personalizzata',
    qty: 2,
    price: 142.75
  },{
    id: 'kit-1',
    title: 'Kit Calcio Personalizzato',
    qty: 1,
    price: 142.75
  }]);

  function toggleComponent(key) {
    setComponents(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleUpload(e) {
    const files = Array.from(e.target.files);
    const mapped = files.map((f, i) => ({ id: Date.now()+i, name: f.name, url: URL.createObjectURL(f) }));
    setUploads(prev => [...prev, ...mapped]);
  }

  function addToQuote() {
    // Questa funzione aggiunge il prodotto personalizzato al carrello (state).
    const newItem = {
      id: 'custom-'+Date.now(),
      title: `Bandiera ${selectedCategory.toUpperCase()} Personalizzata`,
      qty: quantity,
      price: Math.round((Math.random()*100 + 50) * 100) / 100
    };
    setCartItems(prev => [newItem, ...prev]);
  }

  const subtotal = cartItems.reduce((s, it) => s + it.qty * it.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-bold text-xl">TESATURAS</div>
            <nav className="hidden md:flex gap-6 text-sm opacity-90">
              <a className="hover:underline">Home</a>
              <a className="hover:underline">Preventivo</a>
              <a className="hover:underline">Clienti</a>
            </nav>
          </div>
          <div className="hidden md:block">
            <button className="px-4 py-2 bg-white text-slate-800 rounded shadow">Menu</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Main Column */}
        <section className="lg:col-span-2 space-y-8">

          <div className="bg-slate-900 text-white rounded-xl p-8 shadow-lg">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-2xl font-semibold">CREA IL TUO KIT SPORTIVO PERSONALIZZATO</h1>
                <p className="mt-2 text-slate-200">Scegli la categoria per iniziare.</p>
                <button className="mt-4 inline-flex items-center gap-2 bg-emerald-400 text-white px-4 py-2 rounded">CONFIGURA IL TUO KIT</button>
              </div>
              <div className="hidden md:flex gap-4 items-center text-sm opacity-80">
                <div className="p-3 bg-white/5 rounded">BAK'BET</div>
                <div className="p-3 bg-white/5 rounded">VOLLEY</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg">BANDIERE E ESPOSITORI DROP</h3>
            <p className="text-sm text-slate-500 mt-2">Scegli la categoria per iniziare.</p>

            <div className="mt-6 grid grid-cols-3 gap-4">
              {['goccia','vela','rettangolare'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`p-6 rounded-xl border ${selectedCategory===cat ? 'border-emerald-300 shadow' : 'border-gray-200'} bg-white text-center`}
                >
                  <div className="h-12 flex items-center justify-center mb-3">
                    {/* Icon placeholder */}
                    <div className="w-10 h-10 bg-slate-100 rounded-full" />
                  </div>
                  <div className="text-sm font-medium capitalize">{cat}</div>
                </button>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium">QUANTITÀ</label>
                <div className="mt-2 flex items-center gap-3">
                  <input type="number" className="w-24 px-3 py-2 border rounded" min={1} value={quantity} onChange={(e)=>setQuantity(parseInt(e.target.value||1))} />

                  <div className="flex-1">
                    <div className="bg-gray-50 rounded p-3 border-dashed border-2 border-gray-200">
                      <div className="text-xs text-gray-500">TRASCINA O CARICA FILE (PDF/PNG)</div>
                      <div className="mt-2 flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 px-3 py-2 bg-white rounded cursor-pointer">
                          <input type="file" className="hidden" onChange={handleUpload} multiple />
                          <span className="text-sm">SFOGLIA</span>
                        </label>
                        {uploads.slice(0,1).map(u=> (
                          <img key={u.id} src={u.url} alt={u.name} className="w-12 h-12 object-cover rounded" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="text-sm font-medium">COMPONENTI</div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={components.completo} onChange={()=>toggleComponent('completo')} />
                    <span>PACCHETTO COMPLETO (Bandiera + Asta + Base)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={components.soloBandiera} onChange={()=>toggleComponent('soloBandiera')} />
                    <span>SOLO BANDIERA (Telo Stampato)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={components.soloAsta} onChange={()=>toggleComponent('soloAsta')} />
                    <span>SOLO ASTA</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={components.soloBase} onChange={()=>toggleComponent('soloBase')} />
                    <span>SOLO BASE</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={components.zavorra} onChange={()=>toggleComponent('zavorra')} />
                    <span>AGGIUNGI ZAVORRA</span>
                  </label>
                </div>

                <div className="mt-6">
                  <button onClick={addToQuote} className="px-4 py-2 bg-emerald-400 text-white rounded">AGGIUNGI AL PREVENTIVO</button>
                </div>
              </div>

              <div>
                <div className="bg-gray-50 rounded p-4 border">
                  <div className="text-sm font-medium">BANDIERA 2</div>
                  <div className="mt-3 text-xs text-gray-500">Area di anteprima</div>
                  <div className="mt-3 h-28 flex items-center justify-center bg-white border rounded">
                    {uploads.length>0 ? (
                      <img src={uploads[0].url} alt={uploads[0].name} className="h-24 object-contain" />
                    ) : (
                      <div className="text-gray-400">Nessun file caricato</div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 border rounded bg-white">
                  <div className="text-sm font-medium">NOTA</div>
                  <textarea className="w-full mt-2 p-2 border rounded" rows={6} placeholder="Aggiungi note per la richiesta..." />
                </div>
              </div>
            </div>

          </div>

          {/* bottom area could hold more products or selections */}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm sticky top-8">
            <h4 className="font-semibold">IL TUO PREVENTIVO</h4>
            <div className="mt-4 space-y-3">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded flex items-center justify-center text-xs">IMG</div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{item.qty} x {item.title}</div>
                    <div className="text-xs text-gray-500">{item.qty} unità</div>
                  </div>
                  <div className="font-semibold">€ { (item.price * item.qty).toFixed(2) }</div>
                </div>
              ))}

              <div className="mt-4">
                <button className="w-full px-4 py-2 bg-slate-800 text-white rounded">RICHIEDI PREVENTIVO UFFICIALE</button>
              </div>
            </div>

            <div className="mt-4 border-t pt-4">
              <div className="flex items-center justify-between text-sm">
                <div>TOTALE PARZIALE:</div>
                <div className="font-semibold">€ {subtotal.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h5 className="font-medium">BANDIERA 2</h5>
            <div className="mt-3 border p-3 rounded bg-gray-50">
              <div className="text-xs text-gray-500">Trascina o carica file (PDF)</div>
              <div className="mt-3 flex items-center gap-2">
                <label className="px-3 py-2 bg-white rounded cursor-pointer">
                  <input type="file" className="hidden" onChange={handleUpload} />
                  SFOGLIA
                </label>
                <div className="ml-auto flex items-center gap-2">
                  <button className="px-2 py-1 border rounded">-</button>
                  <div className="px-3">{quantity}</div>
                  <button className="px-2 py-1 border rounded">+</button>
                </div>
              </div>
            </div>
          </div>

        </aside>
      </main>

      <footer className="text-center py-6 text-sm text-gray-500">© Tessitore - Demo preventivo</footer>
    </div>
  );
}
