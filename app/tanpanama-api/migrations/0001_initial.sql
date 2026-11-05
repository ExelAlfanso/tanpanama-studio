CREATE TABLE IF NOT EXISTS user (
	id TEXT PRIMARY KEY NOT NULL,
	name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	emailVerified INTEGER NOT NULL,
	image TEXT,
	createdAt INTEGER NOT NULL,
	updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session (
	id TEXT PRIMARY KEY NOT NULL,
	expiresAt INTEGER NOT NULL,
	token TEXT NOT NULL UNIQUE,
	createdAt INTEGER NOT NULL,
	updatedAt INTEGER NOT NULL,
	ipAddress TEXT,
	userAgent TEXT,
	userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS session_userId_idx ON session(userId);

CREATE TABLE IF NOT EXISTS account (
	id TEXT PRIMARY KEY NOT NULL,
	accountId TEXT NOT NULL,
	providerId TEXT NOT NULL,
	userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
	accessToken TEXT,
	refreshToken TEXT,
	idToken TEXT,
	accessTokenExpiresAt INTEGER,
	refreshTokenExpiresAt INTEGER,
	scope TEXT,
	password TEXT,
	createdAt INTEGER NOT NULL,
	updatedAt INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS account_userId_idx ON account(userId);
CREATE UNIQUE INDEX IF NOT EXISTS account_provider_account_idx ON account(providerId, accountId);

CREATE TABLE IF NOT EXISTS verification (
	id TEXT PRIMARY KEY NOT NULL,
	identifier TEXT NOT NULL,
	value TEXT NOT NULL,
	expiresAt INTEGER NOT NULL,
	createdAt INTEGER,
	updatedAt INTEGER
);
CREATE INDEX IF NOT EXISTS verification_identifier_idx ON verification(identifier);

CREATE TABLE IF NOT EXISTS projects (
	id TEXT PRIMARY KEY NOT NULL,
	title TEXT NOT NULL,
	category TEXT NOT NULL,
	summary TEXT NOT NULL,
	description TEXT NOT NULL,
	year TEXT NOT NULL,
	image TEXT NOT NULL CHECK (image IN ('freight', 'ordinal', 'common-ground')),
	featured INTEGER NOT NULL DEFAULT 0,
	published INTEGER NOT NULL DEFAULT 1,
	sort_order INTEGER NOT NULL DEFAULT 0
);

INSERT INTO projects (id, title, category, summary, description, year, image, featured, published, sort_order)
VALUES
	('11111111-1111-4111-8111-111111111111', 'PROJECT-NAME-01', 'Logistics', 'A better way from A to B.', 'One connected story for a business built on movement. Positioning, identity and a new digital home for a European logistics group.', '2026', 'freight', 1, 1, 0),
	('22222222-2222-4222-8222-222222222222', 'PROJECT-NAME-02', 'Industrial technology', 'Make every machine count.', 'Making the value of industrial intelligence visible, from the first conversation to the product demo.', '2026', 'ordinal', 0, 1, 1),
	('33333333-3333-4333-8333-333333333333', 'PROJECT-NAME-03', 'Workplace consultancy', 'Better places. Better working lives.', 'A more human identity for the people rethinking how, and where, business gets done.', '2025', 'common-ground', 0, 1, 2);
