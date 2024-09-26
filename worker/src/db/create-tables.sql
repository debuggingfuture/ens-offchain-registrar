DROP TABLE IF EXISTS whitelist;

CREATE TABLE IF NOT EXISTS whitelist (
	name TEXT NOT NULL PRIMARY KEY,
	addresses TEXT,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
