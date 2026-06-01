import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ORDERS_URL, PLACEHOLDER_IMG, formatPrice, type Product } from "@/lib/types";

type CartItem = Product & { quantity: number };

function groupCart(items: Product[]): CartItem[] {
  const map = new Map<number, CartItem>();
  for (const item of items) {
    if (map.has(item.id)) {
      map.get(item.id)!.quantity += 1;
    } else {
      map.set(item.id, { ...item, quantity: 1 });
    }
  }
  return Array.from(map.values());
}

function InputField({
  label, name, value, onChange, placeholder, type = "text", required = true, icon,
}: {
  label: string; name: string; value: string; onChange: (v: string) => void;
  placeholder: string; type?: string; required?: boolean; icon?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;

  return (
    <div className="relative">
      <label className={`absolute left-4 transition-all duration-200 pointer-events-none z-10 ${
        focused || filled
          ? "top-2 text-xs font-semibold text-brand-purple"
          : "top-1/2 -translate-y-1/2 text-sm text-gray-400"
      }`}>
        {label}{required && " *"}
      </label>
      {icon && (
        <Icon name={icon} size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${focused ? "text-brand-purple" : "text-gray-300"}`} />
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={focused ? placeholder : ""}
        required={required}
        className={`w-full pt-6 pb-2 px-4 border-2 rounded-2xl text-sm text-gray-900 outline-none transition-all duration-200 bg-white ${
          focused ? "border-brand-purple shadow-[0_0_0_4px_rgba(139,92,246,0.08)]" : "border-gray-200 hover:border-gray-300"
        }`}
      />
    </div>
  );
}

type Step = "form" | "success";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartItems: Product[] = location.state?.cartItems || [];
  const sessionId: string = location.state?.sessionId || "";

  const [step, setStep] = useState<Step>("form");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    buyer_name: "",
    phone: "",
    city: "",
    street: "",
    house: "",
    apartment: "",
  });

  const successRef = useRef<HTMLDivElement>(null);

  const grouped = groupCart(cartItems);
  const total = cartItems.reduce((s, p) => s + p.price, 0);
  const delivery = total >= 1500 ? 0 : 299;

  // Редирект если корзина пуста
  useEffect(() => {
    if (cartItems.length === 0) navigate("/", { replace: true });
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (step === "success") successRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [step]);

  function setField(key: keyof typeof form) {
    return (v: string) => setForm((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (sessionId) headers["X-Authorization"] = `Bearer ${sessionId}`;

    try {
      const res = await fetch(`${ORDERS_URL}?action=create`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...form,
          items: grouped.map((p) => ({
            id: p.id, name: p.name, price: p.price, quantity: p.quantity,
            image: p.image, brand: p.brand,
          })),
          total_price: total + delivery,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Произошла ошибка. Попробуйте ещё раз."); return; }
      setOrderNumber(data.order_number);
      setStep("success");
    } catch {
      setError("Нет соединения с сервером. Проверьте интернет и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  // ---- SUCCESS SCREEN ----
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center px-4 py-12" ref={successRef}>
        {/* Confetti dots */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 60}%`,
                backgroundColor: ["#8B5CF6", "#F59E0B", "#10B981", "#EF4444", "#3B82F6"][i % 5],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1.5 + Math.random()}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-brand-purple via-brand-yellow to-green-400" />

          <div className="p-8 text-center">
            {/* Check icon animated */}
            <div className="relative mx-auto w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
              <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                <Icon name="CheckCircle" size={44} className="text-white" />
              </div>
            </div>

            <h1 className="font-montserrat font-black text-3xl text-gray-900 mb-2">Спасибо!</h1>
            <p className="text-gray-500 text-base mb-6">Ваш заказ успешно оформлен</p>

            {/* Order number badge */}
            <div className="bg-brand-purple/8 border border-brand-purple/20 rounded-2xl px-6 py-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Номер вашего заказа</p>
              <p className="font-montserrat font-black text-2xl text-brand-purple tracking-widest">{orderNumber}</p>
            </div>

            {/* Delivery info */}
            <div className="flex flex-col gap-3 mb-7">
              {[
                { icon: "MapPin", label: "Доставка по адресу", value: `${form.city}, ${form.street}, д. ${form.house}${form.apartment ? `, кв. ${form.apartment}` : ""}` },
                { icon: "Phone", label: "Телефон получателя", value: form.phone },
                { icon: "Truck", label: "Ожидаемая доставка", value: "1–3 рабочих дня" },
              ].map((item) => (
                <div key={item.icon} className="flex items-start gap-3 text-left bg-gray-50 rounded-xl px-4 py-3">
                  <Icon name={item.icon} size={16} className="text-brand-purple mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="text-sm font-medium text-gray-800">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center bg-brand-purple text-white rounded-2xl px-5 py-3 mb-6">
              <span className="font-semibold">Итого оплата</span>
              <span className="font-montserrat font-black text-xl">{formatPrice(total + delivery)}</span>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-purple-200 text-base"
            >
              Продолжить покупки
            </button>
            <p className="text-xs text-gray-400 mt-3">Мы свяжемся с вами по номеру {form.phone}</p>
          </div>
        </div>
      </div>
    );
  }

  // ---- CHECKOUT FORM ----
  return (
    <div className="min-h-screen bg-gray-50 font-golos">
      {/* Header */}
      <div className="bg-brand-purple shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <Icon name="ArrowLeft" size={20} />
          </button>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-brand-yellow rounded-lg flex items-center justify-center"><span className="text-base">🛒</span></div>
            <span className="text-white font-montserrat font-black text-lg hidden sm:block">ПРОДАЖНИК</span>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-white/80 text-sm">
            <Icon name="ShieldCheck" size={16} />
            <span className="hidden sm:block">Безопасный заказ</span>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400 cursor-pointer hover:text-brand-purple" onClick={() => navigate("/")}>Корзина</span>
            <Icon name="ChevronRight" size={14} className="text-gray-300" />
            <span className="font-semibold text-brand-purple">Оформление заказа</span>
            <Icon name="ChevronRight" size={14} className="text-gray-300" />
            <span className="text-gray-300">Подтверждение</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-gray-900 mb-7">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT — форма */}
            <div className="lg:col-span-2 flex flex-col gap-5">

              {/* Блок: Данные получателя */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-brand-purple rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="User" size={16} className="text-white" />
                  </div>
                  <h2 className="font-montserrat font-bold text-lg text-gray-900">Данные получателя</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Имя получателя" name="buyer_name"
                    value={form.buyer_name} onChange={setField("buyer_name")}
                    placeholder="Иван Иванов" icon="User"
                  />
                  <InputField
                    label="Телефон" name="phone" type="tel"
                    value={form.phone} onChange={setField("phone")}
                    placeholder="+7 (900) 000-00-00" icon="Phone"
                  />
                </div>
              </div>

              {/* Блок: Адрес доставки */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-8 h-8 bg-brand-yellow rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="MapPin" size={16} className="text-gray-800" />
                  </div>
                  <h2 className="font-montserrat font-bold text-lg text-gray-900">Адрес доставки</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <InputField
                    label="Город" name="city"
                    value={form.city} onChange={setField("city")}
                    placeholder="Москва" icon="Building2"
                  />
                  <InputField
                    label="Улица" name="street"
                    value={form.street} onChange={setField("street")}
                    placeholder="ул. Ленина" icon="MapPin"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField
                      label="Дом" name="house"
                      value={form.house} onChange={setField("house")}
                      placeholder="12А"
                    />
                    <InputField
                      label="Квартира / офис" name="apartment"
                      value={form.apartment} onChange={setField("apartment")}
                      placeholder="42" required={false}
                    />
                  </div>
                </div>
              </div>

              {/* Блок: Способ доставки */}
              <div className="bg-white rounded-3xl shadow-sm p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <Icon name="Truck" size={16} className="text-green-600" />
                  </div>
                  <h2 className="font-montserrat font-bold text-lg text-gray-900">Доставка</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { id: "courier", label: "Курьером до двери", desc: "1–3 дня", price: delivery === 0 ? "Бесплатно" : formatPrice(delivery), checked: true },
                    { id: "pickup", label: "Самовывоз из пункта", desc: "Более 5 000 точек", price: "Бесплатно", checked: false },
                  ].map((opt) => (
                    <label key={opt.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${opt.checked ? "border-brand-purple bg-purple-50" : "border-gray-100 hover:border-gray-200"}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${opt.checked ? "border-brand-purple" : "border-gray-300"}`}>
                        {opt.checked && <div className="w-2.5 h-2.5 rounded-full bg-brand-purple" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm">{opt.label}</p>
                        <p className="text-gray-400 text-xs">{opt.desc}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${opt.price === "Бесплатно" ? "text-green-600" : "text-gray-700"}`}>{opt.price}</span>
                    </label>
                  ))}
                </div>
                {total < 1500 && (
                  <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 mt-3 flex items-center gap-1.5">
                    <Icon name="Info" size={13} />
                    Бесплатная доставка при заказе от {formatPrice(1500)}
                  </p>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-3 text-red-700 animate-fade-in">
                  <Icon name="AlertCircle" size={18} className="shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
            </div>

            {/* RIGHT — сводка */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl shadow-sm p-5 sticky top-6">
                <h2 className="font-montserrat font-bold text-lg text-gray-900 mb-4">
                  Ваш заказ
                  <span className="ml-2 text-sm font-normal text-gray-400">({cartItems.length} шт.)</span>
                </h2>

                {/* Items */}
                <div className="flex flex-col gap-3 mb-4 max-h-64 overflow-y-auto pr-1">
                  {grouped.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center">
                      <img src={item.image || PLACEHOLDER_IMG} alt={item.name} className="w-12 h-12 rounded-xl object-cover shrink-0 bg-gray-50" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-700 line-clamp-2 leading-tight">{item.name}</p>
                        {item.quantity > 1 && <p className="text-xs text-gray-400 mt-0.5">{item.quantity} шт.</p>}
                      </div>
                      <p className="text-sm font-bold text-gray-900 shrink-0">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Товары ({cartItems.length} шт.)</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Доставка</span>
                    <span className={delivery === 0 ? "text-green-600 font-semibold" : ""}>{delivery === 0 ? "Бесплатно" : formatPrice(delivery)}</span>
                  </div>
                  <div className="flex justify-between font-montserrat font-black text-lg text-gray-900 pt-2 border-t border-gray-100">
                    <span>Итого</span>
                    <span className="text-brand-purple">{formatPrice(total + delivery)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-purple-200 text-base flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Icon name="Loader" size={18} className="animate-spin" /> Оформляем...</>
                  ) : (
                    <><Icon name="ShoppingBag" size={18} /> Подтвердить заказ</>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 mt-3 text-gray-400 text-xs">
                  <Icon name="Lock" size={12} />
                  Безопасная обработка данных
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
