import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { PRODUCTS_URL, STATIC_PRODUCTS, formatPrice, PLACEHOLDER_IMG, type Product, type Review } from "@/lib/types";

const STATIC_REVIEWS: Review[] = [
  { id: 1, author: "Анна К.", rating: 5, text: "Отличный товар! Быстрая доставка, упаковка целая. Полностью соответствует описанию, очень довольна покупкой.", date: "15 мая 2024" },
  { id: 2, author: "Дмитрий П.", rating: 4, text: "Хорошее качество за эти деньги. Пользуюсь уже месяц — всё работает отлично. Рекомендую!", date: "3 апреля 2024" },
  { id: 3, author: "Мария С.", rating: 5, text: "Заказывала в подарок мужу. Он в восторге! Упаковано красиво, всё в целостности. Спасибо продавцу!", date: "20 марта 2024" },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sz = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`${sz} ${i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)} onClick={() => onChange(i)}>
          <svg className={`w-7 h-7 transition-colors ${i <= (hover || value) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(STATIC_REVIEWS);
  const [reviewForm, setReviewForm] = useState({ author: "", rating: 5, text: "" });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Gallery images — одно реальное + заглушки
  const galleryImgs = product ? [
    product.image || PLACEHOLDER_IMG,
    PLACEHOLDER_IMG,
    PLACEHOLDER_IMG,
    PLACEHOLDER_IMG,
  ] : [];

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);

    // Сначала ищем в статических
    const staticP = STATIC_PRODUCTS.find((p) => p.id === numId);
    if (staticP) {
      setProduct(staticP);
      setLoading(false);
      return;
    }

    // Иначе грузим из БД
    fetch(`${PRODUCTS_URL}?action=list&limit=200`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const found = Array.isArray(data) ? data.find((p) => p.id === numId) : null;
        setProduct(found || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleAddToCart() {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewForm.author || !reviewForm.text) return;
    const newReview: Review = {
      id: Date.now(),
      author: reviewForm.author,
      rating: reviewForm.rating,
      text: reviewForm.text,
      date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewForm({ author: "", rating: 5, text: "" });
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <Icon name="Loader" size={28} className="animate-spin" />
          <span className="text-lg">Загрузка товара...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Icon name="PackageX" size={56} className="text-gray-300" />
        <h2 className="font-montserrat font-bold text-2xl text-gray-700">Товар не найден</h2>
        <button onClick={() => navigate("/")} className="flex items-center gap-2 bg-brand-purple text-white px-6 py-3 rounded-xl font-semibold hover:bg-brand-purple-dark transition-colors">
          <Icon name="ArrowLeft" size={18} /> На главную
        </button>
      </div>
    );
  }

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : product.rating.toFixed(1);

  return (
    <div className="min-h-screen bg-gray-50 font-golos">
      {/* TOP BAR */}
      <div className="bg-brand-purple sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
            <span className="text-sm font-medium hidden sm:block">Назад</span>
          </button>
          <div className="h-5 w-px bg-white/20 hidden sm:block" />
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-brand-yellow rounded-lg flex items-center justify-center"><span className="text-base">🛒</span></div>
            <span className="text-white font-montserrat font-black text-lg hidden sm:block tracking-tight">ПРОДАЖНИК</span>
          </button>
          <p className="text-white/60 text-sm truncate ml-2 hidden md:block">{product.name}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
          <button onClick={() => navigate("/")} className="hover:text-brand-purple transition-colors">Главная</button>
          <Icon name="ChevronRight" size={14} />
          <button onClick={() => navigate("/")} className="hover:text-brand-purple transition-colors">{product.category}</button>
          <Icon name="ChevronRight" size={14} />
          <span className="text-gray-800 truncate max-w-xs">{product.name}</span>
        </div>

        {/* PRODUCT SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm aspect-square">
              <img
                src={galleryImgs[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {galleryImgs.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(i)}
                  className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? "border-brand-purple shadow-md" : "border-transparent hover:border-gray-200"}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col gap-5">
            {/* Badges */}
            <div className="flex gap-2 flex-wrap">
              {product.discount > 0 && (
                <span className="bg-brand-pink text-white text-sm font-bold px-3 py-1 rounded-full">-{product.discount}%</span>
              )}
              {product.isHit && <span className="bg-brand-yellow text-gray-900 text-sm font-bold px-3 py-1 rounded-full">🔥 Хит продаж</span>}
              {product.isNew && <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">✨ Новинка</span>}
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">{product.brand} · {product.category}</p>
              <h1 className="font-montserrat font-bold text-2xl sm:text-3xl text-gray-900 leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={Number(avgRating)} size="lg" />
              <span className="font-bold text-gray-800">{avgRating}</span>
              <span className="text-gray-400 text-sm">({reviews.length} отзывов)</span>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-2xl p-5">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-montserrat font-black text-4xl text-gray-900">{formatPrice(product.price)}</span>
                {product.oldPrice > 0 && (
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              {product.oldPrice > 0 && (
                <p className="text-green-600 text-sm font-semibold">Вы экономите: {formatPrice(product.oldPrice - product.price)}</p>
              )}
            </div>

            {/* Seller info */}
            {(product.shop_name || product.seller_name) && (
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <div className="w-10 h-10 bg-brand-purple/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="Store" size={18} className="text-brand-purple" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{product.shop_name || product.seller_name}</p>
                  <p className="text-xs text-gray-500">Продавец на Продажнике</p>
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-gray-700">Количество:</p>
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-700 font-bold">−</button>
                  <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors text-gray-700 font-bold">+</button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95 shadow-lg ${
                  added
                    ? "bg-green-500 text-white shadow-green-200"
                    : "bg-brand-purple text-white hover:bg-brand-purple-dark shadow-purple-200"
                }`}
              >
                {added ? "✓ Добавлено в корзину!" : "🛒 Добавить в корзину"}
              </button>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-2xl text-gray-600 hover:border-brand-purple hover:text-brand-purple transition-all font-semibold text-sm">
                  <Icon name="Heart" size={16} /> В избранное
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border-2 border-gray-200 rounded-2xl text-gray-600 hover:border-brand-purple hover:text-brand-purple transition-all font-semibold text-sm">
                  <Icon name="Share2" size={16} /> Поделиться
                </button>
              </div>
            </div>

            {/* Delivery info */}
            <div className="flex flex-col gap-2 border-t pt-4">
              {[
                { icon: "Truck", text: "Доставка от 1 дня" },
                { icon: "Shield", text: "Гарантия качества" },
                { icon: "RotateCcw", text: "Возврат в течение 14 дней" },
              ].map((item) => (
                <div key={item.icon} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon name={item.icon} size={16} className="text-brand-purple shrink-0" />
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DESCRIPTION */}
        {product.description && (
          <section className="bg-white rounded-3xl p-6 shadow-sm mb-8">
            <h2 className="font-montserrat font-bold text-xl text-gray-900 mb-4 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-brand-purple" /> Описание
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>

            {/* Characteristics */}
            <div className="mt-6 border-t pt-5">
              <h3 className="font-semibold text-gray-800 mb-3">Характеристики</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: "Бренд", value: product.brand },
                  { label: "Категория", value: product.category },
                  { label: "Рейтинг", value: `${avgRating} из 5` },
                  { label: "Отзывов", value: String(reviews.length) },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-gray-500 text-sm">{row.label}</span>
                    <span className="text-gray-800 text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* REVIEWS */}
        <section className="bg-white rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-montserrat font-bold text-xl text-gray-900 flex items-center gap-2">
              <Icon name="MessageSquare" size={20} className="text-brand-purple" /> Отзывы
            </h2>
            <div className="flex items-center gap-2">
              <StarRating rating={Number(avgRating)} size="lg" />
              <span className="font-montserrat font-bold text-2xl text-gray-900">{avgRating}</span>
              <span className="text-gray-400 text-sm">/ 5</span>
            </div>
          </div>

          {/* Review list */}
          <div className="flex flex-col gap-4 mb-8">
            {reviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-2xl p-4 animate-fade-in">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-purple/15 rounded-full flex items-center justify-center">
                      <span className="text-brand-purple font-bold text-sm">{review.author[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.author}</p>
                      <p className="text-gray-400 text-xs">{review.date}</p>
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{review.text}</p>
              </div>
            ))}
          </div>

          {/* Write a review */}
          <div className="border-t pt-6">
            <h3 className="font-montserrat font-bold text-lg text-gray-900 mb-4">Оставить отзыв</h3>
            {reviewSubmitted ? (
              <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl p-4 animate-scale-in">
                <Icon name="CheckCircle" size={24} className="text-green-500 shrink-0" />
                <div>
                  <p className="font-semibold text-green-800">Спасибо за отзыв!</p>
                  <p className="text-green-600 text-sm">Ваш отзыв помогает другим покупателям.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Ваша оценка</label>
                  <InteractiveStars value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                </div>
                <input
                  required
                  value={reviewForm.author}
                  onChange={(e) => setReviewForm({ ...reviewForm, author: e.target.value })}
                  placeholder="Ваше имя"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 transition-all"
                />
                <textarea
                  required
                  value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  placeholder="Расскажите о вашем опыте использования товара..."
                  rows={4}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-purple focus:ring-2 focus:ring-purple-100 transition-all resize-none"
                />
                <button type="submit" className="self-start bg-brand-purple text-white font-semibold px-6 py-3 rounded-xl hover:bg-brand-purple-dark transition-colors active:scale-95">
                  Отправить отзыв
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
