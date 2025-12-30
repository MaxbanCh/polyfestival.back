-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user'
);

-- Actors table
CREATE TABLE IF NOT EXISTS actors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    description TEXT
);

-- Festivals table
CREATE TABLE IF NOT EXISTS festivals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    nbtable INTEGER NOT NULL,
    "creationDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    CONSTRAINT valid_dates CHECK ("endDate" >= "startDate")
);

-- Games table
CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    author TEXT NOT NULL,
    type TEXT NOT NULL,
    agemin INTEGER NOT NULL,
    nbminplayers INTEGER NOT NULL DEFAULT 1,
    nbmaxplayers INTEGER NOT NULL DEFAULT 1,
    editor_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    description TEXT,
    notice TEXT,
    prototype BOOLEAN NOT NULL DEFAULT FALSE,
    duree INTEGER NOT NULL DEFAULT 0,
    imageurl TEXT,
    videorulesurl TEXT,
    CONSTRAINT valid_players_range CHECK (nbmaxplayers >= nbminplayers)
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    kind TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT positive_price CHECK (unit_price >= 0),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Tarif zones table
CREATE TABLE IF NOT EXISTS tarif_zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    nbtable INTEGER NOT NULL,
    tableprice NUMERIC(10, 2) NOT NULL,
    pricem2 NUMERIC(10, 2) NOT NULL,
    available_tables INTEGER NOT NULL,
    CONSTRAINT positive_tables CHECK (nbtable >= 0 AND available_tables >= 0 AND available_tables <= nbtable),
    CONSTRAINT positive_prices CHECK (tableprice >= 0 AND pricem2 >= 0)
);

-- Map zones table
CREATE TABLE IF NOT EXISTS map_zones (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    nbtable INTEGER NOT NULL,
    tariffzoneid INTEGER NOT NULL REFERENCES tarif_zones(id) ON DELETE CASCADE,
    description TEXT,
    CONSTRAINT positive_tables CHECK (nbtable >= 0)
);

-- Reservants table
CREATE TABLE IF NOT EXISTS reservants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    reservant_type TEXT NOT NULL CHECK (reservant_type IN ('EDITOR', 'FESTIVAL', 'ORGANIZATION', 'ANIMATOR')),
    billingaddress TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS festival_games (
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (festival_id, game_id),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    festivalId INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    quantityUsedTable INTEGER NOT NULL,
    quantityMaxTable INTEGER NOT NULL
);

-- Create indexes for foreign keys and commonly queried fields
CREATE INDEX IF NOT EXISTS idx_games_editor_id ON games(editor_id);
CREATE INDEX IF NOT EXISTS idx_equipment_festival_id ON equipment(festival_id);
CREATE INDEX IF NOT EXISTS idx_tarif_zones_festival_id ON tarif_zones(festival_id);
CREATE INDEX IF NOT EXISTS idx_map_zones_festival_id ON map_zones(festival_id);
CREATE INDEX IF NOT EXISTS idx_map_zones_tariffzoneid ON map_zones(tariffzoneid);
CREATE INDEX IF NOT EXISTS idx_festivals_dates ON festivals("startDate", "endDate");