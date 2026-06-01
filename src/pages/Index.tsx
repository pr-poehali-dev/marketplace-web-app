import { useState } from "react";
import Icon from "@/components/ui/icon";

const CATEGORIES = [
  { id: 1, name: "Электроника", icon: "Smartphone", color: "bg-blue-100 text-blue-600" },
  { id: 2, name: "Одежда", icon: "Shirt", color: "bg-pink-100 text-pink-600" },
  { id: 3, name: "Дом и сад", icon: "Home", color: "bg-green-100 text-green-600" },
  { id: 4, name: "Красота", icon: "Sparkles", color: "bg-purple-100 text-purple-600" },
  { id: 5, name: "Спорт", icon: "Dumbbell", color: "bg-orange-100 text-orange-600" },
  { id: 6, name: "Детям", icon: "Baby", color: "bg-yellow-100 text-yellow-600" },
  { id: 7, name: "Авто", icon: "Car", color: "bg-gray-100 text-gray-600" },
  { id: 8, name: "Книги", icon: "BookOpen", color: "bg-red-100 text-red-600" },
];

const PRODUCTS = [
  {
    id: 1, name: "Наушники беспроводные Sony WH-1000XM5",
    price: 18990, oldPrice: 29990, discount: 37,
    rating: 4.8, reviews: 2341, brand: "Sony",
    category: "Электроника",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: true,
  },
  {
    id: 2, name: "Смартфон Samsung Galaxy S24 Ultra 256GB",
    price: 79990, oldPrice: 99990, discount: 20,
    rating: 4.9, reviews: 5102, brand: "Samsung",
    category: "Электроника",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: true,
  },
  {
    id: 3, name: "Кофемашина Delonghi Magnifica Start",
    price: 32500, oldPrice: 45000, discount: 28,
    rating: 4.7, reviews: 890, brand: "DeLonghi",
    category: "Дом и сад",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: false,
  },
  {
    id: 4, name: "Пылесос Dyson V15 Detect беспроводной",
    price: 54990, oldPrice: 69990, discount: 21,
    rating: 4.9, reviews: 1234, brand: "Dyson",
    category: "Дом и сад",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: true,
  },
  {
    id: 5, name: "Умные часы Apple Watch Series 9 45mm",
    price: 39990, oldPrice: 49990, discount: 20,
    rating: 4.8, reviews: 3201, brand: "Apple",
    category: "Электроника",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: false,
  },
  {
    id: 6, name: "Сумка женская кожаная через плечо",
    price: 3490, oldPrice: 6990, discount: 50,
    rating: 4.6, reviews: 412, brand: "BagCo",
    category: "Одежда",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: false,
  },
  {
    id: 7, name: "Кресло компьютерное эргономичное IKEA",
    price: 12990, oldPrice: 17990, discount: 28,
    rating: 4.5, reviews: 756, brand: "IKEA",
    category: "Дом и сад",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: false,
  },
  {
    id: 8, name: "Стиральная машина LG 7кг инверторная",
    price: 28990, oldPrice: 36990, discount: 22,
    rating: 4.7, reviews: 2100, brand: "LG",
    category: "Дом и сад",
    image: "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png",
    isHit: true,
  },
];

const BRANDS = ["Apple", "Samsung", "Sony", "Dyson", "DeLonghi", "LG", "IKEA", "BagCo"];

function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}

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

function ProductCard({ product, onAddToCart }: { product: typeof PRODUCTS[0]; onAddToCart: (p: typeof PRODUCTS[0]) => void }) {
  const [added, setAdded] = useState(false);

  function handleAdd() {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer flex flex-col">
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="bg-brand-pink text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{product.discount}%
            </span>
          )}
          {product.isHit && (
            <span className="bg-brand-yellow text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full">
              ХИТ
            </span>
          )}
        </div>
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <StarRating rating={product.rating} />
        <p className="text-sm text-gray-800 font-medium line-clamp-2 leading-tight">{product.name}</p>
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-gray-900 font-montserrat">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              added
                ? "bg-green-500 text-white scale-95"
                : "bg-brand-purple text-white hover:bg-brand-purple-dark active:scale-95"
            }`}
          >
            {added ? "✓ Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [search, setSearch] = useState("");
  const [cartItems, setCartItems] = useState<typeof PRODUCTS>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [minRating, setMinRating] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "hits" | "sale">("all");

  function addToCart(product: typeof PRODUCTS[0]) {
    setCartItems((prev) => [...prev, product]);
  }

  function removeFromCart(id: number) {
    setCartItems((prev) => {
      const idx = prev.findLastIndex((p) => p.id === id);
      if (idx === -1) return prev;
      return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
    });
  }

  const cartCount = cartItems.length;
  const cartTotal = cartItems.reduce((sum, p) => sum + p.price, 0);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || p.category === selectedCategory;
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand);
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchRating = p.rating >= minRating;
    const matchTab = activeTab === "all" || (activeTab === "hits" && p.isHit) || (activeTab === "sale" && p.discount >= 25);
    return matchSearch && matchCategory && matchBrand && matchPrice && matchRating && matchTab;
  });

  function toggleBrand(b: string) {
    setSelectedBrands((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-golos">

      {/* HEADER */}
      <header className="bg-brand-purple sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-3 py-3 flex items-center gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <span className="text-lg">🛒</span>
            </div>
            <span className="text-white font-montserrat font-black text-xl hidden sm:block tracking-tight">
              ПРОДАЖНИК
            </span>
          </div>

          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Искать товары..."
              className="w-full rounded-xl px-4 py-2.5 pr-10 text-sm bg-white text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-yellow"
            />
            <Icon name="Search" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative shrink-0 flex items-center gap-2 bg-brand-yellow text-gray-900 font-semibold px-3 py-2.5 rounded-xl hover:bg-yellow-300 transition-colors"
          >
            <Icon name="ShoppingCart" size={18} />
            <span className="hidden sm:block text-sm">Корзина</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-brand-pink text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile */}
          <button className="shrink-0 w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition-colors">
            <Icon name="User" size={18} className="text-white" />
          </button>
        </div>

        {/* Category nav */}
        <div className="border-t border-white/10">
          <div className="max-w-7xl mx-auto px-3 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                !selectedCategory ? "bg-white text-brand-purple" : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              Все категории
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedCategory === cat.name
                    ? "bg-white text-brand-purple"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon name={cat.icon} fallback="Tag" size={13} />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="bg-gradient-to-r from-brand-purple-dark via-brand-purple to-brand-purple-light py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-brand-yellow text-sm font-semibold uppercase tracking-widest mb-2">Маркетплейс №1</p>
            <h1 className="font-montserrat font-black text-white text-4xl md:text-5xl leading-tight mb-3">
              ПРОДАЖНИК
            </h1>
            <p className="text-white/80 text-lg mb-5">Всё, что нужно — в одном месте!</p>
            <div className="flex gap-3 justify-center md:justify-start">
              <button className="bg-brand-yellow text-gray-900 font-bold px-6 py-3 rounded-xl hover:bg-yellow-300 transition-colors text-sm">
                🛒 Все товары
              </button>
              <button className="bg-white/20 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors text-sm">
                Скидки дня
              </button>
            </div>
          </div>
          <div className="shrink-0 md:ml-auto">
            <img
              src="https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png"
              alt="Продажник"
              className="w-56 h-56 md:w-72 md:h-72 object-cover rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-around text-center">
          {[
            { label: "Товаров", value: "1 200 000+" },
            { label: "Продавцов", value: "45 000+" },
            { label: "Доставка", value: "от 1 дня" },
            { label: "Покупателей", value: "5 млн+" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-montserrat font-bold text-brand-purple text-base md:text-lg">{s.value}</p>
              <p className="text-gray-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="font-montserrat font-bold text-xl text-gray-900 mb-4">Категории товаров</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
              className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all duration-200 hover:scale-105 ${
                selectedCategory === cat.name
                  ? "ring-2 ring-brand-purple bg-purple-50"
                  : "bg-white hover:shadow-md"
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                <Icon name={cat.icon} fallback="Tag" size={20} />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 pb-12 flex gap-6">

        {/* SIDEBAR — desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="bg-white rounded-2xl p-4 shadow-sm sticky top-32">
            <h3 className="font-montserrat font-bold text-gray-900 mb-4">Фильтры</h3>

            {/* Price */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Цена, ₽</p>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="От"
                  value={priceRange[0] || ""}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-purple"
                />
                <input
                  type="number"
                  placeholder="До"
                  value={priceRange[1] || ""}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:border-brand-purple"
                />
              </div>
            </div>

            {/* Brands */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Бренд</p>
              <div className="flex flex-col gap-1.5">
                {BRANDS.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b)}
                      onChange={() => toggleBrand(b)}
                      className="accent-brand-purple w-4 h-4"
                    />
                    <span className="text-sm text-gray-600 group-hover:text-gray-900">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Рейтинг от</p>
              <div className="flex flex-col gap-1">
                {[0, 3, 4, 4.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${
                      minRating === r ? "bg-purple-100 text-brand-purple font-semibold" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {r === 0 ? "Любой" : `★ ${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSelectedBrands([]); setPriceRange([0, 100000]); setMinRating(0); setSelectedCategory(null); }}
              className="w-full text-sm text-brand-purple hover:underline py-1"
            >
              Сбросить фильтры
            </button>
          </div>
        </aside>

        {/* PRODUCTS */}
        <div className="flex-1 min-w-0">
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {(["all", "hits", "sale"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab
                    ? "bg-brand-purple text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab === "all" && "Все товары"}
                {tab === "hits" && "🔥 Хиты продаж"}
                {tab === "sale" && "🏷️ Скидки дня"}
              </button>
            ))}
            {/* Mobile filter button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="ml-auto md:hidden flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <Icon name="SlidersHorizontal" size={15} />
              Фильтры
            </button>
            <span className="hidden md:block ml-auto text-sm text-gray-500">
              Найдено: {filtered.length} товаров
            </span>
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Icon name="SearchX" size={48} className="mx-auto mb-3 opacity-40" />
              <p className="text-lg font-semibold">Товары не найдены</p>
              <p className="text-sm">Попробуйте изменить фильтры или поисковый запрос</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MOBILE SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 overflow-y-auto animate-slide-in-right">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-montserrat font-bold text-gray-900 text-lg">Фильтры</h3>
              <button onClick={() => setSidebarOpen(false)}>
                <Icon name="X" size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Цена, ₽</p>
              <div className="flex gap-2">
                <input type="number" placeholder="От" value={priceRange[0] || ""} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-brand-purple" />
                <input type="number" placeholder="До" value={priceRange[1] || ""} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm outline-none focus:border-brand-purple" />
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Бренд</p>
              <div className="flex flex-col gap-2">
                {BRANDS.map((b) => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="accent-brand-purple w-4 h-4" />
                    <span className="text-sm text-gray-700">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Рейтинг от</p>
              <div className="flex flex-col gap-1">
                {[0, 3, 4, 4.5].map((r) => (
                  <button key={r} onClick={() => setMinRating(r)} className={`text-left text-sm px-2 py-2 rounded-lg transition-colors ${minRating === r ? "bg-purple-100 text-brand-purple font-semibold" : "text-gray-600 hover:bg-gray-50"}`}>
                    {r === 0 ? "Любой" : `★ ${r}+`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => { setSelectedBrands([]); setPriceRange([0, 100000]); setMinRating(0); setSelectedCategory(null); setSidebarOpen(false); }}
              className="w-full bg-brand-purple text-white font-semibold py-3 rounded-xl"
            >
              Применить фильтры
            </button>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-white flex flex-col animate-slide-in-right">
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h2 className="font-montserrat font-bold text-gray-900 text-lg">Корзина</h2>
                <p className="text-sm text-gray-500">{cartCount} товаров</p>
              </div>
              <button onClick={() => setCartOpen(false)}>
                <Icon name="X" size={22} className="text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
                  <Icon name="ShoppingCart" size={48} className="mb-3 opacity-30" />
                  <p className="font-semibold">Корзина пуста</p>
                  <p className="text-sm">Добавьте товары из каталога</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-tight">{item.name}</p>
                      <p className="text-brand-purple font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="shrink-0 text-gray-400 hover:text-red-500 transition-colors">
                      <Icon name="Trash2" size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-900">Итого:</span>
                  <span className="font-montserrat font-black text-xl text-brand-purple">{formatPrice(cartTotal)}</span>
                </div>
                <button className="w-full bg-brand-purple text-white font-bold py-3.5 rounded-xl hover:bg-brand-purple-dark transition-colors text-base">
                  Оформить заказ
                </button>
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
                <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                  <span className="text-lg">🛒</span>
                </div>
                <span className="font-montserrat font-black text-xl">ПРОДАЖНИК</span>
              </div>
              <p className="text-white/60 text-sm max-w-xs">Ваш надёжный маркетплейс. Всё, что нужно — в одном месте!</p>
            </div>
            <div className="flex gap-8 flex-wrap">
              {[
                { title: "Покупателям", links: ["Как сделать заказ", "Доставка", "Возврат", "Акции"] },
                { title: "Компания", links: ["О нас", "Контакты", "Вакансии", "Пресс-центр"] },
              ].map((col) => (
                <div key={col.title}>
                  <p className="font-semibold mb-2 text-sm">{col.title}</p>
                  {col.links.map((l) => (
                    <p key={l} className="text-white/60 text-sm hover:text-white cursor-pointer transition-colors mb-1">{l}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-white/10 mt-6 pt-4 text-center text-white/40 text-xs">
            © 2024 Продажник. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}