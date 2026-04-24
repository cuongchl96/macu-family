# Hướng dẫn Deploy

## Kiến trúc

| Thành phần | Dịch vụ | Trigger deploy |
|------------|---------|----------------|
| Frontend | Vercel | Tự động khi push lên `main` |
| Backend | Render | Tự động khi push lên `main` |
| Database | Neon (PostgreSQL) | Không tự động — cần xử lý thủ công khi đổi schema |

---

## 1. Thay đổi Frontend

Đây là trường hợp phổ biến nhất (sửa UI, thêm tính năng).

```bash
git add -A
git commit -m "feat: mô tả thay đổi"
git push origin main
```

Vercel tự detect push → build → deploy. Thường mất 1–2 phút.
Kiểm tra tại: https://macu-family.vercel.app

---

## 2. Thay đổi Backend (không đổi schema DB)

Sửa logic API, thêm endpoint mới, sửa auth, v.v.

```bash
git add -A
git commit -m "feat: mô tả thay đổi"
git push origin main
```

Render tự detect push → build → deploy. Thường mất 2–3 phút.
Kiểm tra tại: https://macu-family.onrender.com

> **Lưu ý free tier:** Render ngủ sau 15 phút không có request.
> Request đầu tiên sau khi ngủ sẽ chậm ~30 giây (wake-up time).

---

## 3. Thay đổi Schema Database

> ⚠️ Cần cẩn thận — thao tác sai có thể mất data.

App hiện dùng `Base.metadata.create_all` để tạo bảng mới khi khởi động.
**Chỉ tạo thêm bảng mới**, KHÔNG tự động:
- Thêm/xóa cột vào bảng đã có
- Đổi kiểu dữ liệu cột
- Đổi tên bảng/cột

### 3a. Thêm bảng mới

Chỉ cần thêm model trong `backend/app/models/wealth.py` và push — backend tự tạo bảng lúc khởi động.

```bash
git add -A && git commit -m "feat: add new table" && git push
```

### 3b. Thêm cột mới vào bảng đã có

**Bước 1** — Thêm cột vào model (`backend/app/models/wealth.py`):
```python
new_field = Column(String, nullable=True)  # dùng nullable=True cho cột mới
```

**Bước 2** — Chạy lệnh ALTER TABLE trực tiếp trên Neon:

Vào [console.neon.tech](https://console.neon.tech) → chọn project → tab **SQL Editor**, chạy:
```sql
ALTER TABLE ten_bang ADD COLUMN new_field TEXT;
```

**Bước 3** — Push code:
```bash
git add -A && git commit -m "feat: add column new_field" && git push
```

### 3c. Xóa cột / Đổi tên cột / Đổi kiểu dữ liệu

**Bước 1** — Cập nhật model trong code.

**Bước 2** — Chạy SQL thủ công trên Neon SQL Editor:
```sql
-- Xóa cột
ALTER TABLE ten_bang DROP COLUMN ten_cot;

-- Đổi tên cột
ALTER TABLE ten_bang RENAME COLUMN ten_cu TO ten_moi;

-- Đổi kiểu dữ liệu
ALTER TABLE ten_bang ALTER COLUMN ten_cot TYPE FLOAT USING ten_cot::FLOAT;
```

**Bước 3** — Push code.

### 3d. Thay đổi lớn (cần backup trước)

Trước khi làm bất kỳ thay đổi schema phức tạp nào, backup data:

```bash
# Kết nối Neon và dump data ra file JSON
cd backend
python3 -c "
import psycopg2, json, os
conn = psycopg2.connect('NEON_DATABASE_URL_CUA_BAN')
cur = conn.cursor()
tables = ['real_estate_properties','real_estate_payments','savings_deposits',
          'crypto_deposits','crypto_holdings','gold_holdings','capital_contributions']
data = {}
for t in tables:
    cur.execute(f'SELECT * FROM {t}')
    cols = [d[0] for d in cur.description]
    data[t] = [dict(zip(cols, row)) for row in cur.fetchall()]
with open('backup_$(date +%Y%m%d).json', 'w') as f:
    json.dump(data, f, indent=2, default=str)
print('Backup xong')
"
```

---

## 4. Kiểm tra sau khi deploy

```bash
# Kiểm tra backend health
curl https://macu-family.onrender.com/

# Kiểm tra API có yêu cầu auth không (phải trả 403/401)
curl https://macu-family.onrender.com/api/gold_holdings
```

Mở https://macu-family.vercel.app → màn hình PIN → nhập PIN → kiểm tra data đủ không.

---

## 5. Cập nhật biến môi trường

Khi cần đổi PIN, SECRET_KEY, hoặc thêm domain mới vào CORS:

1. Vào [render.com](https://render.com) → **macu-family** → **Environment**
2. Sửa giá trị → **Save Changes**
3. Render tự restart service (không cần push code)

| Biến | Mô tả |
|------|-------|
| `APP_PIN` | Mã PIN đăng nhập (8 số) |
| `SECRET_KEY` | JWT secret — đổi sẽ làm tất cả session hiện tại hết hạn |
| `DATABASE_URL` | PostgreSQL URL từ Neon (`postgresql+asyncpg://...`) |
| `ALLOWED_ORIGINS` | Danh sách domain frontend, cách nhau bằng dấu phẩy |

---

## 6. Rollback khi có sự cố

### Rollback code (Frontend/Backend)
Render và Vercel đều lưu lịch sử deploy:
- **Vercel**: Deployments → chọn bản cũ → **Redeploy**
- **Render**: Events → chọn deploy cũ → **Rollback to this deploy**

### Rollback data
Neon giữ **Point-in-Time Recovery** 7 ngày (free tier).
Vào Neon dashboard → **Branches** → **Restore** để khôi phục.
