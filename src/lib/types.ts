export const AUTH_URL = "https://functions.poehali.dev/e7ad9741-494e-455d-b9c5-c63a007c9435";
export const PRODUCTS_URL = "https://functions.poehali.dev/c530fb1b-11f5-41ef-baf5-38894af16bb4";
export const ORDERS_URL = "https://functions.poehali.dev/88f7c440-20e5-4ce5-adbf-5b0b079d0cea";

export const PLACEHOLDER_IMG = "https://cdn.poehali.dev/projects/f54c580d-2345-48d5-957f-b6e7d132e7c9/bucket/34d8468a-d1d0-40a3-bded-1b33085d6c55.png";

export type User = {
  id: number;
  email: string;
  name: string;
  role: "buyer" | "seller";
  shop_name?: string;
  shop_description?: string;
};

export type Product = {
  id: number;
  seller_id?: number;
  name: string;
  price: number;
  oldPrice: number;
  discount: number;
  rating: number;
  reviews: number;
  brand: string;
  category: string;
  description?: string;
  image: string;
  isHit: boolean;
  isNew?: boolean;
  shop_name?: string;
  seller_name?: string;
};

export type Review = {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export const CATEGORIES = [
  { id: 1, name: "Электроника", icon: "Smartphone", color: "bg-blue-100 text-blue-600" },
  { id: 2, name: "Одежда", icon: "Shirt", color: "bg-pink-100 text-pink-600" },
  { id: 3, name: "Дом и сад", icon: "Home", color: "bg-green-100 text-green-600" },
  { id: 4, name: "Красота", icon: "Sparkles", color: "bg-purple-100 text-purple-600" },
  { id: 5, name: "Спорт", icon: "Dumbbell", color: "bg-orange-100 text-orange-600" },
  { id: 6, name: "Детям", icon: "Baby", color: "bg-yellow-100 text-yellow-600" },
  { id: 7, name: "Авто", icon: "Car", color: "bg-gray-100 text-gray-600" },
  { id: 8, name: "Книги", icon: "BookOpen", color: "bg-red-100 text-red-600" },
];

export const STATIC_PRODUCTS: Product[] = [
  { id: -1, name: "Наушники беспроводные Sony WH-1000XM5", price: 18990, oldPrice: 29990, discount: 37, rating: 4.8, reviews: 2341, brand: "Sony", category: "Электроника", description: "Флагманские наушники с шумоподавлением следующего поколения. До 30 часов работы, быстрая зарядка, складная конструкция. Идеальны для путешествий и работы из дома.", image: PLACEHOLDER_IMG, isHit: true },
  { id: -2, name: "Смартфон Samsung Galaxy S24 Ultra 256GB", price: 79990, oldPrice: 99990, discount: 20, rating: 4.9, reviews: 5102, brand: "Samsung", category: "Электроника", description: "Топовый смартфон с встроенным стилусом S Pen. Камера 200 МП, дисплей Dynamic AMOLED 2X, процессор Snapdragon 8 Gen 3.", image: PLACEHOLDER_IMG, isHit: true },
  { id: -3, name: "Кофемашина Delonghi Magnifica Start", price: 32500, oldPrice: 45000, discount: 28, rating: 4.7, reviews: 890, brand: "DeLonghi", category: "Дом и сад", description: "Автоматическая кофемашина с встроенной кофемолкой. Готовит эспрессо, капучино, латте. Регулировка помола и крепости напитка.", image: PLACEHOLDER_IMG, isHit: false },
  { id: -4, name: "Пылесос Dyson V15 Detect беспроводной", price: 54990, oldPrice: 69990, discount: 21, rating: 4.9, reviews: 1234, brand: "Dyson", category: "Дом и сад", description: "Беспроводной пылесос с лазерным обнаружением пыли. Мощность всасывания 230 АВт, до 60 минут работы, HEPA-фильтр.", image: PLACEHOLDER_IMG, isHit: true },
  { id: -5, name: "Умные часы Apple Watch Series 9", price: 39990, oldPrice: 49990, discount: 20, rating: 4.8, reviews: 3201, brand: "Apple", category: "Электроника", description: "Умные часы с чипом S9, Always-On дисплеем и функцией Double Tap. Мониторинг здоровья 24/7, GPS, водозащита.", image: PLACEHOLDER_IMG, isHit: false },
  { id: -6, name: "Сумка женская кожаная через плечо", price: 3490, oldPrice: 6990, discount: 50, rating: 4.6, reviews: 412, brand: "BagCo", category: "Одежда", description: "Элегантная кожаная сумка ручной работы. Натуральная кожа, металлическая фурнитура, внутренний органайзер.", image: PLACEHOLDER_IMG, isHit: false },
  { id: -7, name: "Кресло компьютерное эргономичное", price: 12990, oldPrice: 17990, discount: 28, rating: 4.5, reviews: 756, brand: "IKEA", category: "Дом и сад", description: "Эргономичное офисное кресло с поясничной поддержкой. Сетчатая спинка, регулируемые подлокотники и высота.", image: PLACEHOLDER_IMG, isHit: false },
  { id: -8, name: "Стиральная машина LG 7кг инверторная", price: 28990, oldPrice: 36990, discount: 22, rating: 4.7, reviews: 2100, brand: "LG", category: "Дом и сад", description: "Стиральная машина с инверторным мотором и системой прямого привода. 14 программ стирки, паровая обработка.", image: PLACEHOLDER_IMG, isHit: true },
];

export function formatPrice(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
}