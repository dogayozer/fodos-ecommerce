'use client'

import { useCallback, useEffect, useState } from 'react'

type Row = {
  id: string; barcode: string; title: string; brand: string | null; slug: string; status: string
  sale_price: number; reference_price: number | null; mpm_sale_price: number | null; mpm_reference_price: number | null
  stock_qty: number; category: { name: string } | null; images: { url: string }[]
}
type Cat = { id: string; name: string }

const STATUS: Record<string, string> = { active: 'Aktif', inactive: 'Pasif', out_of_stock: 'Stok yok' }
const tl = (n: number | null) => (n == null ? '—' : n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ₺')

export function ProductManager() {
  const [rows, setRows] = useState<Row[]>([])
  const [cats, setCats] = useState<Cat[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page) })
    if (query) p.set('q', query)
    if (category) p.set('category', category)
    if (status) p.set('status', status)
    const res = await fetch('/api/admin/products?' + p)
    const d = await res.json()
    setLoading(false)
    if (!res.ok) return alert(d.error || 'Liste alınamadı')
    setRows(d.products); setTotal(d.total); setCats(d.categories); setPageSize(d.pageSize)
  }, [page, query, category, status])

  useEffect(() => { load() }, [load])

  const pages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div>
      <form
        className="flex flex-wrap gap-3 mb-4"
        onSubmit={e => { e.preventDefault(); setPage(1); setQuery(q.trim()) }}
      >
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Ürün adı, barkod, marka, model ara…"
          className="flex-1 min-w-[220px] border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white" />
        <select value={category} onChange={e => { setPage(1); setCategory(e.target.value) }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tüm kategoriler</option>
          <option value="none">Kategorisiz</option>
          {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={status} onChange={e => { setPage(1); setStatus(e.target.value) }} className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">Tüm durumlar</option>
          {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button className="bg-trust-blue-600 text-white px-5 py-2 rounded-lg text-sm font-bold">Ara</button>
      </form>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3 w-16">Resim</th><th className="p-3">Ürün</th><th className="p-3">Kategori</th>
              <th className="p-3 text-right">Fodos</th><th className="p-3 text-right">MPM</th>
              <th className="p-3 text-right">Stok</th><th className="p-3">Durum</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="p-3">
                  {r.images[0]
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={r.images[0].url} alt="" className="w-12 h-12 object-contain rounded border border-gray-200 bg-white" />
                    : <div className="w-12 h-12 rounded border border-dashed border-gray-300 text-[10px] text-gray-400 flex items-center justify-center">yok</div>}
                </td>
                <td className="p-3">
                  <div className="font-semibold text-gray-900 line-clamp-2">{r.title}</div>
                  <div className="text-xs text-gray-500">{r.barcode}{r.brand ? ` · ${r.brand}` : ''}</div>
                </td>
                <td className="p-3 text-gray-600">{r.category?.name ?? '—'}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="font-bold">{tl(r.sale_price)}</div>
                  {r.reference_price != null && <div className="text-xs text-gray-400 line-through">{tl(r.reference_price)}</div>}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <div className="font-bold">{tl(r.mpm_sale_price)}</div>
                  {r.mpm_reference_price != null && <div className="text-xs text-gray-400 line-through">{tl(r.mpm_reference_price)}</div>}
                </td>
                <td className="p-3 text-right">{r.stock_qty}</td>
                <td className="p-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'active' ? 'bg-green-100 text-green-700' : r.status === 'inactive' ? 'bg-gray-200 text-gray-600' : 'bg-amber-100 text-amber-700'}`}>
                    {STATUS[r.status] ?? r.status}
                  </span>
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <a href={`/urun/${r.slug}`} target="_blank" rel="noreferrer" className="text-xs text-gray-500 hover:underline mr-3">Görüntüle</a>
                  <button onClick={() => setEditId(r.id)} className="bg-trust-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Düzenle</button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr><td colSpan={8} className="p-8 text-center text-gray-400">{loading ? 'Yükleniyor…' : 'Ürün bulunamadı'}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <span>{total.toLocaleString('tr-TR')} ürün</span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40">Önceki</button>
          <span>{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 border rounded-lg bg-white disabled:opacity-40">Sonraki</button>
        </div>
      </div>

      {editId && <EditModal id={editId} cats={cats} onClose={() => setEditId(null)} onSaved={() => { setEditId(null); load() }} />}
    </div>
  )
}

function EditModal({ id, cats, onClose, onSaved }: { id: string; cats: Cat[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>(null)
  const [images, setImages] = useState<string[]>([])
  const [newUrl, setNewUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/admin/products?id=' + id).then(r => r.json()).then(d => {
      if (d.error) return setErr(d.error)
      const p = d.product
      setImages(p.images.map((i: any) => i.url))
      setF({
        id: p.id, barcode: p.barcode, slug: p.slug,
        title: p.title ?? '', brand: p.brand ?? '', model_code: p.model_code ?? '', categoryId: p.categoryId ?? '',
        sale_price: p.sale_price ?? '', reference_price: p.reference_price ?? '',
        mpm_sale_price: p.mpm_sale_price ?? '', mpm_reference_price: p.mpm_reference_price ?? '',
        dealer_price: p.dealerPrice?.price ?? '',
        stock_qty: p.stock_qty ?? 0, status: p.status, campaign: p.campaign ?? '',
        has_real_photo: p.has_real_photo, description_raw: p.description_raw ?? '',
      })
    })
  }, [id])

  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }))
  const move = (i: number, d: number) => setImages(a => {
    const b = [...a]; const j = i + d
    if (j < 0 || j >= b.length) return a
    ;[b[i], b[j]] = [b[j], b[i]]; return b
  })
  const addUrl = () => {
    const u = newUrl.trim()
    if (!u) return
    setImages(a => [...a, u]); setNewUrl('')
  }

  const save = async () => {
    setSaving(true); setErr('')
    const { barcode, slug, ...body } = f
    const res = await fetch('/api/admin/products', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, images }),
    })
    const d = await res.json()
    setSaving(false)
    if (!res.ok) return setErr(d.error || 'Kaydedilemedi')
    onSaved()
  }

  const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white'
  const lbl = 'block text-xs font-semibold text-gray-600 mb-1'

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl my-6 shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-bold text-lg">Ürünü Düzenle</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl leading-none px-2">×</button>
        </div>
        {!f ? <p className="p-8 text-center text-gray-400">{err || 'Yükleniyor…'}</p> : (
          <div className="p-4 space-y-5">
            <p className="text-xs text-gray-500">Barkod: <b>{f.barcode}</b> · Adres: /urun/{f.slug} (değişmez)</p>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className={lbl}>Ürün adı</label><input className={inp} value={f.title} onChange={e => set('title', e.target.value)} /></div>
              <div><label className={lbl}>Marka</label><input className={inp} value={f.brand} onChange={e => set('brand', e.target.value)} /></div>
              <div><label className={lbl}>Model kodu</label><input className={inp} value={f.model_code} onChange={e => set('model_code', e.target.value)} /></div>
              <div>
                <label className={lbl}>Kategori</label>
                <select className={inp} value={f.categoryId} onChange={e => set('categoryId', e.target.value)}>
                  <option value="">Kategorisiz</option>
                  {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className={lbl}>Durum</label>
                <select className={inp} value={f.status} onChange={e => set('status', e.target.value)}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div><label className={lbl}>Stok</label><input type="number" min={0} className={inp} value={f.stock_qty} onChange={e => set('stock_qty', e.target.value)} /></div>
              <div><label className={lbl}>Kampanya anahtarı (boş = yok)</label><input className={inp} value={f.campaign} onChange={e => set('campaign', e.target.value)} /></div>
            </div>

            <fieldset className="border rounded-lg p-3">
              <legend className="text-xs font-bold text-gray-700 px-1">Fiyatlar (₺, KDV dahil) — eski fiyat boşsa üstü çizili fiyat gösterilmez</legend>
              <div className="grid sm:grid-cols-2 gap-3">
                <div><label className={lbl}>Fodos satış fiyatı</label><input type="number" step="0.01" min={0} className={inp} value={f.sale_price} onChange={e => set('sale_price', e.target.value)} /></div>
                <div><label className={lbl}>Fodos eski fiyat</label><input type="number" step="0.01" min={0} className={inp} value={f.reference_price} onChange={e => set('reference_price', e.target.value)} /></div>
                <div><label className={lbl}>MPM satış fiyatı</label><input type="number" step="0.01" min={0} className={inp} value={f.mpm_sale_price} onChange={e => set('mpm_sale_price', e.target.value)} /></div>
                <div><label className={lbl}>MPM eski fiyat</label><input type="number" step="0.01" min={0} className={inp} value={f.mpm_reference_price} onChange={e => set('mpm_reference_price', e.target.value)} /></div>
                <div><label className={lbl}>Bayi fiyatı (boş = bayi fiyatı yok)</label><input type="number" step="0.01" min={0} className={inp} value={f.dealer_price} onChange={e => set('dealer_price', e.target.value)} /></div>
              </div>
            </fieldset>

            <fieldset className="border rounded-lg p-3">
              <legend className="text-xs font-bold text-gray-700 px-1">Resimler — ilk resim ana resimdir</legend>
              <div className="flex flex-wrap gap-3 mb-3">
                {images.map((u, i) => (
                  <div key={u + i} className="w-28 border rounded-lg p-1.5 text-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="" className="w-full h-24 object-contain bg-gray-50 rounded" />
                    <div className="text-[10px] font-bold mt-1 text-gray-500">{i === 0 ? 'ANA RESİM' : `#${i + 1}`}</div>
                    <div className="flex justify-center gap-1 mt-1">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 border rounded text-xs disabled:opacity-30">←</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="px-1.5 border rounded text-xs disabled:opacity-30">→</button>
                      <button type="button" onClick={() => setImages(a => a.filter((_, j) => j !== i))} className="px-1.5 border rounded text-xs text-red-600">Sil</button>
                    </div>
                  </div>
                ))}
                {!images.length && <p className="text-xs text-gray-400">Resim yok</p>}
              </div>
              <div className="flex gap-2">
                <input className={inp} placeholder="Resim adresi (https://… veya /dijital/…)" value={newUrl}
                  onChange={e => setNewUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }} />
                <button type="button" onClick={addUrl} className="bg-gray-800 text-white px-4 rounded-lg text-sm font-bold whitespace-nowrap">Ekle</button>
              </div>
              <label className="flex items-center gap-2 mt-3 text-sm">
                <input type="checkbox" checked={f.has_real_photo} onChange={e => set('has_real_photo', e.target.checked)} />
                Gerçek ürün fotoğrafı (kategori listesinde öne çıkar)
              </label>
            </fieldset>

            <div>
              <label className={lbl}>Açıklama (HTML)</label>
              <textarea rows={8} className={inp + ' font-mono text-xs'} value={f.description_raw} onChange={e => set('description_raw', e.target.value)} />
            </div>

            {err && <p className="text-sm text-red-600 font-semibold">{err}</p>}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button onClick={onClose} className="px-5 py-2 border rounded-lg text-sm">İptal</button>
              <button onClick={save} disabled={saving} className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold disabled:opacity-50">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
