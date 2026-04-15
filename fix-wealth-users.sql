-- Bảng wealth_users cần phải có cột auth_id nối về Supabase Auth
ALTER TABLE wealth_users ADD COLUMN auth_id UUID UNIQUE;
