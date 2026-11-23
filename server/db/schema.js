/* Database schema, created idempotently. The server runs this at every
startup, before it starts listening, so a fresh database (such as a new
Freepod deployment's) needs no separate migration step. */

export const ensureSchema = async (db) => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS users(
      id SERIAL PRIMARY KEY,
      username VARCHAR (150) UNIQUE NOT NULL,
      password VARCHAR (150) NOT NULL,
      dimension VARCHAR(150) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS memories(
      id UUID PRIMARY KEY,
      title VARCHAR(150),
      image_url VARCHAR(255),
      description TEXT,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      dimension VARCHAR(150)
    );
  `);
};
