#!/usr/bin/env python3
"""
Migrate data từ SQLite local sang PostgreSQL (Neon).

Usage:
  python3 migrate_to_postgres.py "postgresql://user:pass@host/dbname?sslmode=require"

Lấy DATABASE_URL từ Neon dashboard → Connection String (psycopg2 format).
"""

import sys
import sqlite3
import os

SQLITE_PATH = os.path.join(os.path.dirname(__file__), "wealth.db")


# ---------------------------------------------------------------------------
# DDL — tạo bảng theo đúng schema của ứng dụng
# Dùng TEXT thay vì native ENUM để đơn giản và tương thích SQLAlchemy
# ---------------------------------------------------------------------------
DDL = """
CREATE TABLE IF NOT EXISTS real_estate_properties (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    total_value DOUBLE PRECISION NOT NULL,
    paid_amount DOUBLE PRECISION NOT NULL,
    currency    TEXT NOT NULL,
    owner       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS real_estate_payments (
    id          TEXT PRIMARY KEY,
    property_id TEXT NOT NULL REFERENCES real_estate_properties(id) ON DELETE CASCADE,
    due_date    DATE NOT NULL,
    amount      DOUBLE PRECISION NOT NULL,
    is_paid     BOOLEAN NOT NULL DEFAULT FALSE,
    note        TEXT,
    currency    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS savings_deposits (
    id            TEXT PRIMARY KEY,
    name          TEXT,
    bank_name     TEXT NOT NULL,
    principal     DOUBLE PRECISION NOT NULL,
    interest_rate DOUBLE PRECISION NOT NULL,
    start_date    DATE NOT NULL,
    maturity_date DATE NOT NULL,
    currency      TEXT NOT NULL,
    owner         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crypto_deposits (
    id       TEXT PRIMARY KEY,
    amount   DOUBLE PRECISION NOT NULL,
    date     DATE NOT NULL,
    note     TEXT,
    currency TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS crypto_holdings (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    symbol        TEXT NOT NULL,
    amount        DOUBLE PRECISION NOT NULL,
    purchase_cost DOUBLE PRECISION NOT NULL,
    current_price DOUBLE PRECISION NOT NULL,
    purchase_date DATE NOT NULL,
    owner         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS gold_holdings (
    id             TEXT PRIMARY KEY,
    taels          DOUBLE PRECISION NOT NULL,
    purchase_price DOUBLE PRECISION NOT NULL,
    current_price  DOUBLE PRECISION NOT NULL,
    purchase_date  DATE NOT NULL,
    owner          TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS capital_contributions (
    id       TEXT PRIMARY KEY,
    amount   DOUBLE PRECISION NOT NULL,
    date     DATE NOT NULL,
    note     TEXT,
    currency TEXT NOT NULL,
    owner    TEXT NOT NULL
);
"""

TABLES = [
    "real_estate_properties",
    "real_estate_payments",
    "savings_deposits",
    "crypto_deposits",
    "crypto_holdings",
    "gold_holdings",
    "capital_contributions",
]


def migrate(pg_url: str) -> None:
    try:
        import psycopg2
        from psycopg2.extras import execute_values
    except ImportError:
        print("Cài psycopg2-binary...")
        import subprocess
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2
        from psycopg2.extras import execute_values

    # --- Đọc dữ liệu từ SQLite ---
    if not os.path.exists(SQLITE_PATH):
        print(f"Không tìm thấy file SQLite: {SQLITE_PATH}")
        sys.exit(1)

    sqlite_conn = sqlite3.connect(SQLITE_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    data: dict[str, list[dict]] = {}
    for table in TABLES:
        rows = sqlite_conn.execute(f'SELECT * FROM "{table}"').fetchall()
        data[table] = [dict(r) for r in rows]
        print(f"  SQLite {table}: {len(data[table])} dòng")
    sqlite_conn.close()

    # --- Kết nối PostgreSQL ---
    print("\nKết nối PostgreSQL...")
    pg_conn = psycopg2.connect(pg_url)
    pg_conn.autocommit = False
    cur = pg_conn.cursor()

    # --- Tạo bảng ---
    print("Tạo bảng...")
    cur.execute(DDL)

    # --- Kiểm tra bảng đã có dữ liệu chưa ---
    cur.execute("SELECT COUNT(*) FROM real_estate_properties")
    existing = cur.fetchone()[0]
    if existing > 0:
        print(f"\nCẢNH BÁO: Đã có {existing} dòng trong real_estate_properties.")
        answer = input("Tiếp tục sẽ xóa và ghi đè toàn bộ. Nhập 'yes' để xác nhận: ").strip()
        if answer.lower() != "yes":
            print("Hủy.")
            pg_conn.close()
            sys.exit(0)
        # Xóa theo thứ tự phụ thuộc khóa ngoại
        for table in reversed(TABLES):
            cur.execute(f'DELETE FROM "{table}"')
        print("Đã xóa dữ liệu cũ.")

    # --- Insert dữ liệu ---
    for table in TABLES:
        rows = data[table]
        if not rows:
            print(f"  {table}: bỏ qua (không có dữ liệu)")
            continue

        cols = list(rows[0].keys())
        col_str = ", ".join(f'"{c}"' for c in cols)
        placeholders = ", ".join(["%s"] * len(cols))

        values = []
        for row in rows:
            vals = []
            for col in cols:
                val = row[col]
                # SQLite lưu Boolean là 0/1 — chuyển sang Python bool
                if col == "is_paid":
                    val = bool(val)
                vals.append(val)
            values.append(tuple(vals))

        cur.executemany(
            f'INSERT INTO "{table}" ({col_str}) VALUES ({placeholders})',
            values,
        )
        print(f"  {table}: đã insert {len(values)} dòng")

    pg_conn.commit()
    cur.close()
    pg_conn.close()
    print("\n✓ Migration hoàn thành!")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    migrate(sys.argv[1])
