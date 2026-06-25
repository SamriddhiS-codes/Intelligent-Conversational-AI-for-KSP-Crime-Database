DROP TABLE IF EXISTS crimes;
DROP TABLE IF EXISTS police_stations;


CREATE TABLE police_stations (
    id          SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    district    TEXT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);


CREATE TABLE crimes (

    id                    SERIAL PRIMARY KEY,

    fir_number            TEXT UNIQUE NOT NULL,
    crime_type            TEXT NOT NULL,
    ipc_bns_sections      TEXT,
    severity              TEXT,

    incident_date         DATE,
    report_date           DATE,

    district              TEXT,
    police_station        TEXT,
    location_description  TEXT,
    latitude              DECIMAL(9,6),
    longitude             DECIMAL(9,6),

    complainant_name      TEXT,
    complainant_age       INTEGER,
    complainant_gender    TEXT,
    complainant_contact   TEXT,

    accused_name          TEXT,
    accused_age           INTEGER,
    accused_gender        TEXT,
    accused_count         INTEGER DEFAULT 1,
    weapon_used           TEXT,
    is_juvenile_involved  BOOLEAN DEFAULT FALSE,

    case_status           TEXT DEFAULT 'open',
    case_outcome          TEXT,
    property_loss_inr     DECIMAL(12,2),
    investigating_officer TEXT,

    created_at            TIMESTAMP DEFAULT NOW(),

    station_id            INTEGER REFERENCES police_stations(id)
);


CREATE INDEX idx_crimes_district
    ON crimes(district);

CREATE INDEX idx_crimes_crime_type
    ON crimes(crime_type);

CREATE INDEX idx_crimes_case_status
    ON crimes(case_status);

CREATE INDEX idx_crimes_incident_date
    ON crimes(incident_date);

CREATE INDEX idx_crimes_accused_name
    ON crimes(accused_name);


CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    username        VARCHAR UNIQUE NOT NULL,
    email           VARCHAR UNIQUE NOT NULL,
    hashed_password VARCHAR NOT NULL,
    role            VARCHAR DEFAULT 'investigator',
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

