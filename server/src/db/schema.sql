-- Пользователи
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('b2c','b2b_employee','admin','ministry')),
  enterprise_id INTEGER REFERENCES enterprises(id),
  consent_to_pd INTEGER NOT NULL DEFAULT 0,
  is_blocked INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Предприятия
CREATE TABLE IF NOT EXISTS enterprises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  contacts TEXT NOT NULL,
  social_links TEXT,
  certificates TEXT,
  photos TEXT,
  is_active INTEGER DEFAULT 0,
  average_rating REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Шаблоны экскурсий
CREATE TABLE IF NOT EXISTS excursions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  default_price REAL NOT NULL,
  max_participants INTEGER NOT NULL,
  min_participants INTEGER DEFAULT 1,
  photo_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Слоты (конкретные даты и время)
CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  excursion_id INTEGER NOT NULL REFERENCES excursions(id),
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  available_slots INTEGER NOT NULL,
  price_per_person REAL NOT NULL,
  is_cancelled INTEGER DEFAULT 0
);

-- Сувениры / мерч
CREATE TABLE IF NOT EXISTS souvenirs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enterprise_id INTEGER NOT NULL REFERENCES enterprises(id),
  name TEXT NOT NULL,
  description TEXT,
  base_price REAL NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  photo_url TEXT,
  is_available INTEGER DEFAULT 1,
  allows_personalization INTEGER DEFAULT 0,
  personalization_type TEXT
);

-- Бронирования
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  slot_id INTEGER NOT NULL REFERENCES slots(id),
  participants_count INTEGER NOT NULL,
  total_price REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','paid','confirmed','cancelled','completed')),
  payment_id TEXT,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  cancellation_date DATETIME
);

-- Заказы сувениров
CREATE TABLE IF NOT EXISTS souvenir_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  souvenir_id INTEGER NOT NULL REFERENCES souvenirs(id),
  quantity INTEGER NOT NULL,
  personalization_text TEXT,
  final_price REAL NOT NULL,
  enterprise_confirmed INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending','confirmed','rejected','in_production','ready_for_pickup','fulfilled'))
);

-- Отзывы
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  booking_id INTEGER NOT NULL REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment TEXT,
  is_moderated INTEGER DEFAULT 0,
  moderator_comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Уведомления
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);