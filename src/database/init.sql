-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    validated BOOLEAN DEFAULT FALSE
);

-- Actors table
CREATE TABLE IF NOT EXISTS actors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    actor_type TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    description TEXT
);

-- Actor contacts table
CREATE TABLE IF NOT EXISTS actor_contacts (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Festivals table
CREATE TABLE IF NOT EXISTS festivals (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    "creationDate" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    description TEXT,
    "startDate" TIMESTAMP NOT NULL,
    "endDate" TIMESTAMP NOT NULL,
    CONSTRAINT valid_dates CHECK ("endDate" >= "startDate")
);

-- Actor festivals table
CREATE TABLE IF NOT EXISTS actor_festivals (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    actor_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    contacted BOOLEAN DEFAULT FALSE,
    last_contact_date TIMESTAMP,
    status TEXT,
    has_reservation BOOLEAN DEFAULT FALSE,
    UNIQUE(festival_id, actor_id)
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

-- Festival equipment stocks table
CREATE TABLE IF NOT EXISTS festival_equipment_stocks (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    quantity_available INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT positive_quantity CHECK (quantity_available >= 0)
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
    surface NUMERIC(10, 2),
    tariffzoneid INTEGER NOT NULL REFERENCES tarif_zones(id) ON DELETE CASCADE,
    description TEXT,
    CONSTRAINT positive_tables CHECK (nbtable >= 0),
    CONSTRAINT positive_surface CHECK (surface IS NULL OR surface >= 0)
);

-- Festival games table
CREATE TABLE IF NOT EXISTS festival_games (
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    PRIMARY KEY (festival_id, game_id),
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Tables table
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    CONSTRAINT positive_quantity CHECK (quantity >= 0)
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    festival_id INTEGER NOT NULL REFERENCES festivals(id) ON DELETE CASCADE,
    reservant_id INTEGER NOT NULL REFERENCES actors(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'NOT_CONTACTED' CHECK (status IN ('NOT_CONTACTED', 'CONTACTED', 'DISCUSSION', 'WILL_BE_ABSENT', 'CONSIDERED_ABSENT', 'CONFIRMED', 'INVOICED', 'PAID')),
    price_before_discount NUMERIC(10, 2),
    discount_amount NUMERIC(10, 2),
    total_price NUMERIC(10, 2),
    free_tables INTEGER,
    presents_games BOOLEAN DEFAULT FALSE,
    games_list_requested BOOLEAN DEFAULT FALSE,
    games_list_received BOOLEAN DEFAULT FALSE,
    games_received BOOLEAN DEFAULT FALSE,
    CONSTRAINT positive_prices CHECK (
        (price_before_discount IS NULL OR price_before_discount >= 0) AND
        (discount_amount IS NULL OR discount_amount >= 0) AND
        (total_price IS NULL OR total_price >= 0)
    )
);

-- Reservation contacts table
CREATE TABLE IF NOT EXISTS reservation_contacts (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES actor_contacts(id) ON DELETE SET NULL,
    contact_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservation notes table
CREATE TABLE IF NOT EXISTS reservation_notes (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    contact_id INTEGER REFERENCES actor_contacts(id) ON DELETE SET NULL,
    author TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservation tariffzone allocations table
CREATE TABLE IF NOT EXISTS reservation_tariffzone_allocations (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    tariffzone_id INTEGER NOT NULL REFERENCES tarif_zones(id) ON DELETE CASCADE,
    quantity_tables INTEGER NOT NULL DEFAULT 0,
    quantity_area_sqm NUMERIC(10, 2) NOT NULL DEFAULT 0,
    CONSTRAINT positive_quantities CHECK (quantity_tables >= 0 AND quantity_area_sqm >= 0)
);

-- Reservation games table
CREATE TABLE IF NOT EXISTS reservation_games (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    editor_actor_id INTEGER REFERENCES actors(id) ON DELETE SET NULL,
    tables_needed NUMERIC(10, 2),
    chairs_needed INTEGER,
    outlets_needed INTEGER,
    CONSTRAINT positive_needs CHECK (
        (tables_needed IS NULL OR tables_needed >= 0) AND
        (chairs_needed IS NULL OR chairs_needed >= 0) AND
        (outlets_needed IS NULL OR outlets_needed >= 0)
    )
);

-- Reservation game placements table
CREATE TABLE IF NOT EXISTS reservation_game_placements (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    tables_allocated NUMERIC(10, 2) NOT NULL DEFAULT 0,
    table_type TEXT NOT NULL,
    chairs_allocated INTEGER,
    outlets_allocated INTEGER,
    mapzone_id INTEGER REFERENCES map_zones(id) ON DELETE SET NULL,
    CONSTRAINT positive_allocations CHECK (
        tables_allocated >= 0 AND
        (chairs_allocated IS NULL OR chairs_allocated >= 0) AND
        (outlets_allocated IS NULL OR outlets_allocated >= 0)
    )
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    number TEXT NOT NULL UNIQUE,
    amount_ttc NUMERIC(10, 2) NOT NULL,
    vat_rate NUMERIC(5, 2) NOT NULL DEFAULT 20,
    issued_at TIMESTAMP,
    due_date TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
    CONSTRAINT positive_amounts CHECK (amount_ttc >= 0 AND vat_rate >= 0 AND vat_rate <= 100)
);

-- Create indexes for foreign keys and commonly queried fields
CREATE INDEX IF NOT EXISTS idx_actor_contacts_actor_id ON actor_contacts(actor_id);
CREATE INDEX IF NOT EXISTS idx_actor_festivals_festival_id ON actor_festivals(festival_id);
CREATE INDEX IF NOT EXISTS idx_actor_festivals_actor_id ON actor_festivals(actor_id);
CREATE INDEX IF NOT EXISTS idx_festival_equipment_stocks_festival_id ON festival_equipment_stocks(festival_id);
CREATE INDEX IF NOT EXISTS idx_festival_equipment_stocks_equipment_id ON festival_equipment_stocks(equipment_id);
CREATE INDEX IF NOT EXISTS idx_reservations_festival_id ON reservations(festival_id);
CREATE INDEX IF NOT EXISTS idx_reservations_reservant_id ON reservations(reservant_id);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_reservation_contacts_reservation_id ON reservation_contacts(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_contacts_contact_id ON reservation_contacts(contact_id);
CREATE INDEX IF NOT EXISTS idx_reservation_notes_reservation_id ON reservation_notes(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_notes_contact_id ON reservation_notes(contact_id);
CREATE INDEX IF NOT EXISTS idx_reservation_tariffzone_allocations_reservation_id ON reservation_tariffzone_allocations(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_tariffzone_allocations_tariffzone_id ON reservation_tariffzone_allocations(tariffzone_id);
CREATE INDEX IF NOT EXISTS idx_reservation_games_reservation_id ON reservation_games(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_games_game_id ON reservation_games(game_id);
CREATE INDEX IF NOT EXISTS idx_reservation_games_editor_actor_id ON reservation_games(editor_actor_id);
CREATE INDEX IF NOT EXISTS idx_reservation_game_placements_reservation_id ON reservation_game_placements(reservation_id);
CREATE INDEX IF NOT EXISTS idx_reservation_game_placements_game_id ON reservation_game_placements(game_id);
CREATE INDEX IF NOT EXISTS idx_reservation_game_placements_mapzone_id ON reservation_game_placements(mapzone_id);
CREATE INDEX IF NOT EXISTS idx_invoices_reservation_id ON invoices(reservation_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_games_editor_id ON games(editor_id);
CREATE INDEX IF NOT EXISTS idx_equipment_festival_id ON equipment(festival_id);
CREATE INDEX IF NOT EXISTS idx_tarif_zones_festival_id ON tarif_zones(festival_id);
CREATE INDEX IF NOT EXISTS idx_map_zones_festival_id ON map_zones(festival_id);
CREATE INDEX IF NOT EXISTS idx_map_zones_tariffzoneid ON map_zones(tariffzoneid);
CREATE INDEX IF NOT EXISTS idx_festivals_dates ON festivals("startDate", "endDate");