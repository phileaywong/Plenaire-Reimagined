
import psycopg2
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DB_CONFIG = {
    "database": os.getenv("DATABASE_NAME", "plenaire_ecommerce"),
    "user": os.getenv("DATABASE_USER", "postgres"),
    "password": os.getenv("DATABASE_PASSWORD", ""),
    "host": os.getenv("DATABASE_HOST", "0.0.0.0"),
    "port": os.getenv("DATABASE_PORT", "5432")
}

# Enumerated Types
SQL_CREATE_ENUMS = [
    """
    DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'admin');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    """,
    """
    DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    """,
    """
    DO $$ BEGIN
        CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;
    """
]

# Table Creation Statements
SQL_CREATE_TABLES = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        first_name TEXT NULL,
        last_name TEXT NULL,
        phone TEXT NULL,
        role user_role NULL DEFAULT 'user',
        login_attempts INTEGER NULL DEFAULT 0,
        lock_until TIMESTAMP WITH TIME ZONE NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id INTEGER NOT NULL,
        captcha_text TEXT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NULL,
        image_url TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        featured BOOLEAN NULL DEFAULT false,
        review_count INTEGER NULL DEFAULT 0,
        ingredients TEXT[] NULL,
        category_id INTEGER NULL,
        stock INTEGER NULL DEFAULT 100,
        sku TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS lifestyle_items (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT NOT NULL,
        link TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        address_line1 TEXT NOT NULL,
        address_line2 TEXT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        postal_code TEXT NOT NULL,
        country TEXT NOT NULL,
        is_default BOOLEAN NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS wishlists (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS carts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS cart_items (
        id SERIAL PRIMARY KEY,
        cart_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        order_number TEXT NOT NULL UNIQUE,
        status order_status NULL DEFAULT 'pending',
        total DOUBLE PRECISION NOT NULL,
        shipping_address_id INTEGER NOT NULL,
        billing_address_id INTEGER NOT NULL,
        payment_status payment_status NULL DEFAULT 'pending',
        stripe_payment_intent_id TEXT NULL,
        notes TEXT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """,
    """
    CREATE TABLE IF NOT EXISTS enquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        user_id INTEGER NULL,
        is_resolved BOOLEAN NULL DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT now()
    );
    """
]

# Foreign Key Constraints
SQL_ADD_FOREIGN_KEYS = [
    "ALTER TABLE sessions ADD CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
    "ALTER TABLE products ADD CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL;",
    "ALTER TABLE addresses ADD CONSTRAINT fk_addresses_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
    "ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
    "ALTER TABLE wishlists ADD CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;",
    "ALTER TABLE reviews ADD CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
    "ALTER TABLE reviews ADD CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;",
    "ALTER TABLE carts ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;",
    "ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE;",
    "ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE;",
    "ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE RESTRICT;",
    "ALTER TABLE orders ADD CONSTRAINT fk_orders_shipping_address FOREIGN KEY (shipping_address_id) REFERENCES addresses (id) ON DELETE RESTRICT;",
    "ALTER TABLE orders ADD CONSTRAINT fk_orders_billing_address FOREIGN KEY (billing_address_id) REFERENCES addresses (id) ON DELETE RESTRICT;",
    "ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE;",
    "ALTER TABLE order_items ADD CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE RESTRICT;",
    "ALTER TABLE enquiries ADD CONSTRAINT fk_enquiries_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;"
]

# Indexes for common queries
SQL_CREATE_INDEXES = [
    "CREATE INDEX IF NOT EXISTS idx_products_featured ON products (featured) WHERE featured = true;",
    "CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);",
    "CREATE INDEX IF NOT EXISTS idx_products_name_search ON products USING gin (to_tsvector('english', name));",
    "CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);",
    "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);",
    "CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);",
    "CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id);"
]

def create_schema():
    """Creates the complete database schema."""
    conn = None
    cursor = None
    try:
        print(f"Connecting to database '{DB_CONFIG['database']}' on {DB_CONFIG['host']}...")
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("Connection successful.")

        # Create Enumerated Types
        print("\nCreating enumerated types...")
        for sql in SQL_CREATE_ENUMS:
            print(f"Executing: {sql.strip()[:100]}...")
            cursor.execute(sql)
        conn.commit()
        print("Enumerated types created (or already exist).")

        # Create Tables
        print("\nCreating tables...")
        for sql in SQL_CREATE_TABLES:
            table_name = sql.split('CREATE TABLE IF NOT EXISTS')[1].split('(')[0].strip()
            print(f"Creating table: {table_name}")
            cursor.execute(sql)
        print("Tables created (or already exist).")

        # Add Foreign Key Constraints
        print("\nAdding foreign key constraints...")
        for sql in SQL_ADD_FOREIGN_KEYS:
            constraint_name = sql.split("ADD CONSTRAINT ")[1].split(" ")[0]
            try:
                print(f"Adding constraint: {constraint_name}")
                cursor.execute(sql)
            except psycopg2.Error as e:
                if e.pgcode in ('42P07', '42710'):
                    print(f"Constraint {constraint_name} already exists, skipping.")
                    conn.rollback()
                else:
                    raise
        print("Foreign key constraints added (or already exist).")

        # Create Indexes
        print("\nCreating indexes...")
        for sql in SQL_CREATE_INDEXES:
            index_name = sql.split('CREATE INDEX IF NOT EXISTS ')[1].split(' ')[0]
            try:
                print(f"Creating index: {index_name}")
                cursor.execute(sql)
            except psycopg2.Error as e:
                if e.pgcode == '42P07':
                    print(f"Index {index_name} already exists, skipping.")
                    conn.rollback()
                else:
                    raise
        print("Indexes created (or already exist).")

        # Commit all changes
        conn.commit()
        print("\nSchema creation completed successfully.")

    except psycopg2.Error as e:
        print(f"\nDatabase error: {e}")
        if conn:
            conn.rollback()
        print("Schema creation failed. Changes rolled back.")
        raise

    except Exception as e:
        print(f"\nUnexpected error: {e}")
        if conn:
            conn.rollback()
        print("Schema creation failed. Changes rolled back.")
        raise

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    create_schema()
