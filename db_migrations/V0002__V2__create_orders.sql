CREATE TABLE IF NOT EXISTS t_p15421197_marketplace_web_app.orders (
  id SERIAL PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  house TEXT NOT NULL,
  apartment TEXT DEFAULT '',
  items JSONB NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  user_id INTEGER REFERENCES t_p15421197_marketplace_web_app.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON t_p15421197_marketplace_web_app.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON t_p15421197_marketplace_web_app.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON t_p15421197_marketplace_web_app.orders(order_number);
