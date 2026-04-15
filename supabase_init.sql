-- Bảng thông tin người dùng cơ bản (Tuỳ chọn nếu dùng chung gia đình, nhưng nên có để mở rộng)
CREATE TABLE wealth_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('husband', 'wife', 'joint')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Tiết kiệm (Savings Deposit)
CREATE TABLE savings_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name TEXT NOT NULL,
  principal NUMERIC NOT NULL,
  interest_rate NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  maturity_date DATE NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  owner TEXT NOT NULL CHECK (owner IN ('husband', 'wife', 'joint')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Bất động sản (Real Estate Properties)
CREATE TABLE real_estate_properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  total_value NUMERIC NOT NULL,
  paid_amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  owner TEXT NOT NULL CHECK (owner IN ('husband', 'wife', 'joint')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lịch thanh toán BĐS (Real Estate Payments)
-- Liên kết Ràng buộc với bảng real_estate_properties
CREATE TABLE real_estate_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES real_estate_properties(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng Vàng (Gold Holdings)
CREATE TABLE gold_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  taels NUMERIC NOT NULL,               -- Số lượng (Lượng)
  purchase_price NUMERIC NOT NULL,      -- Giá mua
  current_price NUMERIC NOT NULL DEFAULT 0, -- Giá hiện tại lưu trữ tạm (thường không cần vì lấy từ API, nhưng giữ cho đồng nhất type)
  purchase_date DATE NOT NULL,
  owner TEXT NOT NULL CHECK (owner IN ('husband', 'wife', 'joint')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng lệnh nạp tiền mã hoá (Crypto Deposits)
CREATE TABLE crypto_deposits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount NUMERIC NOT NULL,
  date DATE NOT NULL,
  note TEXT,
  currency TEXT NOT NULL CHECK (currency IN ('VND', 'USD')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bảng tài sản mã hoá (Crypto Holdings)
CREATE TABLE crypto_holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  symbol TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  purchase_cost NUMERIC NOT NULL,
  current_price NUMERIC NOT NULL DEFAULT 0,
  purchase_date DATE NOT NULL,
  owner TEXT NOT NULL CHECK (owner IN ('husband', 'wife', 'joint')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bật tính năng Row Level Security (RLS) cho phép truy cập public (cho mục đích Demo)
-- TRONG THỰC TẾ: Nên giới hạn theo auth.uid() của supabase.
ALTER TABLE wealth_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE savings_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE real_estate_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gold_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE crypto_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON wealth_users FOR SELECT USING (true);
CREATE POLICY "Allow public all access" ON savings_deposits FOR ALL USING (true);
CREATE POLICY "Allow public all access" ON real_estate_properties FOR ALL USING (true);
CREATE POLICY "Allow public all access" ON real_estate_payments FOR ALL USING (true);
CREATE POLICY "Allow public all access" ON gold_holdings FOR ALL USING (true);
CREATE POLICY "Allow public all access" ON crypto_deposits FOR ALL USING (true);
CREATE POLICY "Allow public all access" ON crypto_holdings FOR ALL USING (true);
