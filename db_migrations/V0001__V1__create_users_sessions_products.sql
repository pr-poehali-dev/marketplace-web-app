CREATE TABLE IF NOT EXISTS t_p15421197_marketplace_web_app.users (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer',
  shop_name TEXT,
  shop_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p15421197_marketplace_web_app.sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p15421197_marketplace_web_app.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE TABLE IF NOT EXISTS t_p15421197_marketplace_web_app.products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER REFERENCES t_p15421197_marketplace_web_app.users(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  old_price INTEGER DEFAULT 0,
  discount INTEGER DEFAULT 0,
  brand TEXT NOT NULL DEFAULT 'Мой магазин',
  category TEXT NOT NULL DEFAULT 'Электроника',
  description TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  is_hit BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,1) DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON t_p15421197_marketplace_web_app.products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON t_p15421197_marketplace_web_app.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON t_p15421197_marketplace_web_app.products(is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON t_p15421197_marketplace_web_app.sessions(user_id);
