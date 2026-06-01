import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import {
  AUTH_URL, PRODUCTS_URL, STATIC_PRODUCTS, CATEGORIES, PLACEHOLDER_IMG,
  formatPrice, type User, type Product
} from "@/lib/types";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`w-3 h-3 ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1 group cursor-pointer flex flex-col"
    >
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img src={product.image || PLACEHOLDER_IMG} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && <span className="bg-brand-pink text-white text-xs font-bold px-2 py-0.5 rounded-full">-{product.discount}%</span>}
          {product.isHit && <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">ХИТ</span>}
          {product.isNew && <span className="bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">НОВИНКА</span>}
        </div>
        <div className="absolute inset-0 bg-brand-purple/0 group-hover:bg-brand-purple/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/95 text-brand-purple text-xs font-bold px-3 py-1.5 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform">
            Смотреть →
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <StarRating rating={product.rating} />
        <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-tight">{product.name}</p>
        {product.shop_name && <p className="text-xs text-gray-400 truncate">{product.shop_name}</p>}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900 font-montserrat">{formatPrice(product.price)}</span>
            {product.oldPrice > 0 && <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>
          <button onClick={handleAdd} className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${added ? "bg-green-500 text-white scale-95" : "bg-brand-purple text-white hover:bg-brand-purple-dark active:scale-95"}`}>
            {added ? "✓ Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- AUTH MODAL ----
function AuthModal({ onClose, onAuth }: { onClose: () => void; onAuth: (u: User, sid: string) => void }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [form, setForm] = useState({ email: "", password: "", name: "", shop_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}?action=${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Ошибка"); return; }
      onAuth(data.user, data.session_id);
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden">
        <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="font-montserrat font-black text-white text-xl">{tab === "login" ? "Вход" : "Регистрация"}</h2>
            <p className="text-white/70 text-sm mt-0.5">Маркетплейс Продажник</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><Icon name="X" size={18} className="text-white" /></button>
        </div>
        <div className="flex border-b">
          {(["login", "register"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === t ? "text-brand-purple border-b-2 border-brand-purple" : "text-gray-500 hover:text-gray-700"}`}>
              {t === "login" ? "Войти" : "Создать аккаунт"}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {tab === "register" && (
            <>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ваше имя" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setRole("buyer")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${role === "buyer" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600"}`}>🛍️ Покупатель</button>
                <button type="button" onClick={() => setRole("seller")} className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${role === "seller" ? "border-brand-purple bg-purple-50 text-brand-purple" : "border-gray-200 text-gray-600"}`}>🏪 Продавец</button>
              </div>
              {role === "seller" && <input value={form.shop_name} onChange={(e) => setForm({ ...form, shop_name: e.target.value })} placeholder="Название магазина" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />}
            </>
          )}
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
          <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Пароль (минимум 6 символов)" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
          {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60">
            {loading ? "Загрузка..." : tab === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---- EDIT PRODUCT MODAL ----
function EditProductModal({ product, sessionId, onClose, onSaved }: {
  product: Product; sessionId: string; onClose: () => void; onSaved: (p: Product) => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    brand: product.brand,
    category: product.category,
    description: product.description || "",
  });
  const [saving, setSaving] = useState(false);
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImg(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const body: Record<string, string | number> = {
      id: product.id,
      name: form.name,
      price: Number(form.price),
      brand: form.brand,
      category: form.category,
      description: form.description,
    };
    if (previewImg) body.image_url = previewImg;

    const res = await fetch(`${PRODUCTS_URL}?action=update`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${sessionId}` },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      onSaved({ ...product, ...form, price: Number(form.price), image: previewImg || product.image });
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden">
        <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple px-5 py-4 flex items-center justify-between">
          <h3 className="font-montserrat font-black text-white text-lg">Редактировать товар</h3>
          <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><Icon name="X" size={18} className="text-white" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3 max-h-[75vh] overflow-y-auto">
          {/* Photo */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 cursor-pointer" onClick={() => fileRef.current?.click()}>
            <img src={previewImg || product.image || PLACEHOLDER_IMG} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-700">Изменить фото</p>
              <p className="text-xs text-gray-400">Нажмите чтобы выбрать файл</p>
            </div>
            <Icon name="Camera" size={18} className="text-gray-400 ml-auto" />
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />

          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
          <div className="grid grid-cols-2 gap-3">
            <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Цена, ₽ *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
            <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Бренд" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
          </div>
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 bg-white">
            {CATEGORIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 resize-none" />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-600 font-semibold hover:border-gray-300">Отмена</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-purple text-white font-bold rounded-xl hover:bg-brand-purple-dark transition-colors disabled:opacity-60">
              {saving ? "Сохраняю..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---- SELLER CABINET ----
function SellerCabinet({ user, sessionId, onClose, onProductsReload }: {
  user: User; sessionId: string; onClose: () => void; onProductsReload: () => void;
}) {
  const navigate = useNavigate();
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: "", price: "", brand: "", category: "Электроника", description: "" });
  const [previewImg, setPreviewImg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMyProducts = useCallback(() => {
    setLoading(true);
    fetch(`${PRODUCTS_URL}?action=my`, { headers: { "X-Authorization": `Bearer ${sessionId}` } })
      .then((r) => r.json())
      .then((data) => { setMyProducts(Array.isArray(data) ? data : []); })
      .finally(() => setLoading(false));
  }, [sessionId]);

  useEffect(() => { loadMyProducts(); }, [loadMyProducts]);

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImg(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetch(`${PRODUCTS_URL}?action=create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${sessionId}` },
      body: JSON.stringify({ ...form, price: Number(form.price), image_url: previewImg || "" }),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false); setShowAddForm(false);
        setForm({ name: "", price: "", brand: "", category: "Электроника", description: "" });
        setPreviewImg(null);
        loadMyProducts();
        onProductsReload();
      }, 1500);
    } else { alert(data.error || "Ошибка"); }
    setSubmitting(false);
  }

  async function deleteProduct(id: number) {
    if (!confirm("Удалить товар? Он пропадёт из каталога.")) return;
    await fetch(`${PRODUCTS_URL}?action=delete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Authorization": `Bearer ${sessionId}` },
      body: JSON.stringify({ id }),
    });
    setMyProducts((prev) => prev.filter((p) => p.id !== id));
    onProductsReload();
  }

  function handleSaved(updated: Product) {
    setMyProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
    onProductsReload();
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden flex flex-col max-h-[90vh]">

          {/* Header */}
          <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple px-5 py-4 flex items-center justify-between shrink-0">
            <div>
              <h2 className="font-montserrat font-black text-white text-lg">Кабинет продавца</h2>
              <p className="text-white/70 text-sm">{user.shop_name || user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1.5 bg-brand-yellow text-gray-900 font-bold px-3 py-2 rounded-xl text-sm hover:bg-yellow-300 transition-colors">
                <Icon name="Plus" size={15} /> Добавить товар
              </button>
              <button onClick={onClose} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30">
                <Icon name="X" size={18} className="text-white" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex border-b px-5 py-3 gap-6 shrink-0 bg-white">
            <div><p className="font-montserrat font-bold text-brand-purple text-xl">{myProducts.length}</p><p className="text-gray-500 text-xs">Товаров</p></div>
            <div><p className="font-montserrat font-bold text-brand-purple text-xl">{formatPrice(myProducts.reduce((s, p) => s + p.price, 0))}</p><p className="text-gray-500 text-xs">Суммарная стоимость</p></div>
            <div><p className="font-montserrat font-bold text-brand-purple text-xl">{(myProducts.reduce((s, p) => s + p.rating, 0) / (myProducts.length || 1)).toFixed(1)}</p><p className="text-gray-500 text-xs">Средний рейтинг</p></div>
          </div>

          {/* Product list */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-400">
                <Icon name="Loader" size={24} className="animate-spin mr-2" /> Загрузка...
              </div>
            ) : myProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Icon name="Package" size={40} className="mb-3 opacity-30" />
                <p className="font-semibold">У вас пока нет товаров</p>
                <button onClick={() => setShowAddForm(true)} className="mt-3 text-brand-purple text-sm font-semibold hover:underline">Добавить первый товар →</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {myProducts.map((p) => (
                  <div key={p.id} className="flex gap-3 bg-gray-50 rounded-xl p-3 items-center group hover:bg-purple-50 transition-colors">
                    <img
                      src={p.image || PLACEHOLDER_IMG}
                      alt={p.name}
                      className="w-14 h-14 rounded-lg object-cover shrink-0 cursor-pointer"
                      onClick={() => navigate(`/product/${p.id}`)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.brand}</p>
                      <p className="text-brand-purple font-bold text-sm mt-1">{formatPrice(p.price)}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => navigate(`/product/${p.id}`)}
                        title="Смотреть"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-purple hover:bg-white rounded-lg transition-colors"
                      >
                        <Icon name="Eye" size={15} />
                      </button>
                      <button
                        onClick={() => setEditingProduct(p)}
                        title="Редактировать"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-purple hover:bg-white rounded-lg transition-colors"
                      >
                        <Icon name="Pencil" size={15} />
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        title="Удалить"
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-white rounded-lg transition-colors"
                      >
                        <Icon name="Trash2" size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add product modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl animate-fade-in overflow-hidden">
            <div className="bg-gradient-to-r from-brand-purple-dark to-brand-purple px-5 py-4 flex items-center justify-between">
              <h3 className="font-montserrat font-black text-white text-lg">Новый товар</h3>
              <button onClick={() => setShowAddForm(false)} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30"><Icon name="X" size={18} className="text-white" /></button>
            </div>
            {success ? (
              <div className="flex flex-col items-center py-12 animate-scale-in">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-3"><Icon name="CheckCircle" size={30} className="text-green-500" /></div>
                <p className="font-montserrat font-bold text-gray-900 text-lg">Товар добавлен!</p>
                <p className="text-gray-500 text-sm mt-1">Виден всем покупателям в каталоге</p>
              </div>
            ) : (
              <form onSubmit={handleAddSubmit} className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
                <div
                  className={`border-2 border-dashed rounded-2xl transition-all cursor-pointer overflow-hidden ${dragOver ? "border-brand-purple bg-purple-50" : "border-gray-200 hover:border-brand-purple"}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewImg ? (
                    <img src={previewImg} alt="preview" className="w-full h-40 object-cover" />
                  ) : (
                    <div className="flex flex-col items-center py-6 gap-2">
                      <Icon name="ImagePlus" size={24} className="text-brand-purple" />
                      <p className="text-sm font-semibold text-gray-700">Загрузить фото</p>
                      <p className="text-xs text-gray-400">PNG, JPG — перетащите или нажмите</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] ?? null)} />
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Название товара *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
                <div className="grid grid-cols-2 gap-3">
                  <input required type="number" min="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Цена, ₽ *" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
                  <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Бренд / магазин" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100" />
                </div>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 bg-white">
                  {CATEGORIES.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Описание товара..." rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 resize-none" />
                <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold py-3.5 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-purple-200">
                  {submitting ? "Публикация..." : "Опубликовать товар"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          sessionId={sessionId}
          onClose={() => setEditingProduct(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}

// ---- MAIN PAGE ----
export default function Index() {
  const [search, setSearch] = useState("");
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "hits" | "sale">("all");

  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string>(() => localStorage.getItem("session_id") || "");
  const [authOpen, setAuthOpen] = useState(false);
  const [cabinetOpen, setCabinetOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const sid = localStorage.getItem("session_id");
    if (!sid) return;
    fetch(`${AUTH_URL}?action=me`, { headers: { "X-Authorization": `Bearer ${sid}` } })
      .then((r) => r.json())
      .then((d) => { if (d.user) setUser(d.user); })
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(() => {
    fetch(`${PRODUCTS_URL}?action=list`)
      .then((r) => r.json())
      .then((d) => setDbProducts(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function handleAuth(u: User, sid: string) {
    setUser(u); setSessionId(sid);
    localStorage.setItem("session_id", sid);
    setAuthOpen(false);
    if (u.role === "seller") setCabinetOpen(true);
  }

  function handleLogout() {
    fetch(`${AUTH_URL}?action=logout`, { method: "POST", headers: { "X-Authorization": `Bearer ${sessionId}` } });
    setUser(null); setSessionId(""); localStorage.removeItem("session_id"); setUserMenuOpen(false);
  }

  const allProducts = [...dbProducts, ...STATIC_PRODUCTS];

  const filtered = allProducts.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchRating = p.rating >= minRating;
    const matchTab = activeTab === "all" || (activeTab === "hits" && p.isHit) || (activeTab === "sale" && p.discount >= 20);
    return matchSearch && matchCategory && matchBrand && matchPrice && matchRating && matchTab;
  });

  const allBrands = Array.from(new Set(allProducts.map((p) => p.brand)));
  function addToCart(product: Product) { setCartItems((prev) => [...prev, product]); }
  function removeFromCart(id: number) {
    setCartItems((prev) => { const idx = prev.findLastIndex((p) => p.id === id); return idx === -1 ? prev : [...prev.slice(0, idx), ...prev.slice(idx + 1)]; });
  }
  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="min-h-screen bg-gray-50 font-golos" onClick={() => userMenuOpen && setUserMenuOpen(false)}>

      {/* HEADER */}
      <header className="bg-brand-purple sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center"><span className="text-lg">🛒</span></div>
            <span className="text-white font-montserrat font-black text-xl hidden sm:block tracking-tight">ПРОДАЖНИК</span>
          </div>
          <div className="flex-1 relative">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Искать товары..." className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-yellow" />
            <Icon name="Search" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
          <button onClick={() => setCartOpen(true)} className="relative shrink-0 flex items-center gap-2 bg-brand-yellow text-gray-900 font-semibold px-3 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors">
            <Icon name="ShoppingCart" size={18} />
            <span className="hidden sm:block text-sm">Корзина</span>
            {cartCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>}
          </button>
          {user ? (
            <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 bg-white/15 border border-white/30 text-white px-3 py-2.5 rounded-xl hover:bg-white/25 transition-all">
                <Icon name="User" size={16} />
                <span className="hidden sm:block text-sm font-semibold max-w-20 truncate">{user.name}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-48 z-50 animate-scale-in">
                  <div className="px-3 py-2 border-b mb-1">
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.role === "seller" ? "🏪 Продавец" : "🛍️ Покупатель"}</p>
                  </div>
                  {user.role === "seller" && (
                    <button onClick={() => { setCabinetOpen(true); setUserMenuOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-brand-purple rounded-xl flex items-center gap-2">
                      <Icon name="LayoutDashboard" size={15} /> Мой кабинет
                    </button>
                  )}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl flex items-center gap-2">
                    <Icon name="LogOut" size={15} /> Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="shrink-0 flex items-center gap-1.5 bg-white/15 border border-white/30 text-white font-semibold px-3 py-2.5 rounded-xl hover:bg-white/25 transition-all text-sm">
              <Icon name="User" size={16} /><span className="hidden sm:block">Войти</span>
            </button>
          )}
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <button onClick={() => setSelectedCategory(null)} className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${!selectedCategory ? "bg-white text-brand-purple" : "text-white/80 hover:text-white hover:bg-white/10"}`}>Все категории</button>
            {CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${selectedCategory === cat.name ? "bg-white text-brand-purple" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                <Icon name={cat.icon} fallback="Tag" size={13} />{cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO */}
      <div className="bg-gradient-to-r from-brand-purple-dark via-brand-purple to-brand-purple-light py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-brand-yellow text-sm font-semibold uppercase tracking-widest mb-2">Маркетплейс №1</p>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl leading-tight mb-3">ПРОДАЖНИК</h1>
            <p className="text-white/80 text-lg mb-5">Всё, что нужно — в одном месте!</p>
            <div className="flex gap-3 justify-center md:justify-start flex-wrap">
              <button onClick={() => setActiveTab("all")} className="bg-brand-yellow text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm">🛒 Все товары</button>
              {!user ? (
                <button onClick={() => setAuthOpen(true)} className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">🏪 Стать продавцом</button>
              ) : user.role === "seller" ? (
                <button onClick={() => setCabinetOpen(true)} className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">🏪 Мой кабинет</button>
              ) : null}
            </div>
          </div>
          <div className="shrink-0 md:ml-auto">
            <img src={PLACEHOLDER_IMG} alt="Продажник" className="w-56 h-56 md:w-64 md:h-64 object-cover rounded-2xl shadow-2xl" />
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around text-center">
          {[{ label: "Товаров", value: `${allProducts.length}+` }, { label: "Продавцов", value: "45 000+" }, { label: "Доставка", value: "от 1 дня" }, { label: "Покупателей", value: "5 млн+" }].map((s) => (
            <div key={s.label}><p className="font-montserrat font-bold text-brand-purple text-base md:text-lg">{s.value}</p><p className="text-gray-500 text-xs">{s.label}</p></div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-montserrat font-bold text-xl text-gray-900 mb-4">Категории товаров</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)} className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:scale-105 ${selectedCategory === cat.name ? "ring-2 ring-brand-purple bg-purple-50" : "bg-white hover:shadow-md"}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}><Icon name={cat.icon} fallback="Tag" size={20} /></div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">
        {/* SIDEBAR */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-32">
            <h3 className="font-montserrat font-bold text-gray-900 mb-4">Фильтры</h3>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Цена, ₽</p>
              <div className="flex gap-2">
                <input type="number" placeholder="От" onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-purple" />
                <input type="number" placeholder="До" onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || 1000000])} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-purple" />
              </div>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Бренд</p>
              <div className="flex flex-col gap-1.5 max-h-44 overflow-y-auto">
                {allBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])} className="accent-brand-purple w-4 h-4" />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900 truncate">{b}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Рейтинг от</p>
              {[0, 3, 4, 4.5].map((r) => (
                <button key={r} onClick={() => setMinRating(r)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${minRating === r ? "bg-purple-100 text-brand-purple font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                  {r === 0 ? "Любой" : `★ ${r}+`}
                </button>
              ))}
            </div>
            <button onClick={() => { setSelectedBrands([]); setPriceRange([0, 1000000]); setMinRating(0); setSelectedCategory(null); }} className="w-full text-sm text-brand-purple hover:underline py-1">Сбросить фильтры</button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {(["all", "hits", "sale"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? "bg-brand-purple text-white shadow-md" : "bg-white text-gray-600 hover:bg-gray-100"}`}>
                {tab === "all" && "Все товары"}{tab === "hits" && "🔥 Хиты"}{tab === "sale" && "🏷️ Скидки"}
              </button>
            ))}
            <button onClick={() => setSidebarOpen(true)} className="ml-auto md:hidden flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700">
              <Icon name="SlidersHorizontal" size={15} /> Фильтры
            </button>
            <span className="hidden md:block ml-auto text-sm text-gray-500">{filtered.length} товаров</span>
          </div>

          {dbProducts.length > 0 && (
            <div className="mb-3 px-3 py-2 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700 flex items-center gap-2">
              <Icon name="CheckCircle" size={16} />{dbProducts.length} товаров от продавцов
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => <ProductCard key={product.id} product={product} onAddToCart={addToCart} />)}
            </div>
          )}
        </div>
      </main>

      {/* MOBILE SIDEBAR */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-montserrat font-bold text-gray-900 text-lg">Фильтры</h3>
              <button onClick={() => setSidebarOpen(false)}><Icon name="X" size={22} className="text-gray-500" /></button>
            </div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Бренд</p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                {allBrands.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => setSelectedBrands((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])} className="accent-brand-purple w-4 h-4" />
                    <span className="text-sm text-gray-700 truncate">{b}</span>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={() => { setSelectedBrands([]); setPriceRange([0, 1000000]); setMinRating(0); setSelectedCategory(null); setSidebarOpen(false); }} className="w-full bg-brand-purple text-white font-semibold py-3 rounded-xl">Применить</button>
          </div>
        </div>
      )}

      {/* CART */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white flex flex-col animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between">
              <div><h2 className="font-montserrat font-bold text-gray-900 text-lg">Корзина</h2><p className="text-sm text-gray-500">{cartCount} товаров</p></div>
              <button onClick={() => setCartOpen(false)}><Icon name="X" size={22} className="text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
                  <Icon name="ShoppingCart" size={48} className="mb-3 opacity-30" /><p className="font-semibold">Корзина пуста</p>
                </div>
              ) : cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                  <img src={item.image || PLACEHOLDER_IMG} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                    <p className="text-brand-purple font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="shrink-0 text-gray-400 hover:text-red-500"><Icon name="Trash2" size={16} /></button>
                </div>
              ))}
            </div>
            {cartItems.length > 0 && (
              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-900">Итого:</span>
                  <span className="font-montserrat font-black text-xl text-brand-purple">{formatPrice(cartTotal)}</span>
                </div>
                <button className="w-full bg-brand-purple text-white font-bold py-3.5 rounded-xl hover:bg-brand-purple-dark transition-colors">Оформить заказ</button>
                <p className="text-center text-xs text-gray-400 mt-2">Бесплатная доставка от 1 500 ₽</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-brand-purple-dark text-white mt-8">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center"><span className="text-lg">🛒</span></div>
                <span className="font-montserrat font-black text-xl">ПРОДАЖНИК</span>
              </div>
              <p className="text-white/60 text-sm max-w-xs">Ваш надёжный маркетплейс. Всё, что нужно — в одном месте!</p>
            </div>
            <div className="flex gap-8 flex-wrap">
              {[{ title: "Покупателям", links: ["Как сделать заказ", "Доставка", "Возврат", "Акции"] }, { title: "Компания", links: ["О нас", "Контакты", "Вакансии", "Пресс-центр"] }].map((col) => (
                <div key={col.title}>
                  <p className="font-semibold mb-2 text-sm">{col.title}</p>
                  {col.links.map((l) => <p key={l} className="text-white/60 text-sm hover:text-white cursor-pointer transition-colors mb-1">{l}</p>)}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-4 text-center text-white/40 text-xs">© 2024 Продажник. Все права защищены.</div>
        </div>
      </footer>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onAuth={handleAuth} />}
      {cabinetOpen && user && sessionId && (
        <SellerCabinet user={user} sessionId={sessionId} onClose={() => setCabinetOpen(false)} onProductsReload={loadProducts} />
      )}
    </div>
  );
}
