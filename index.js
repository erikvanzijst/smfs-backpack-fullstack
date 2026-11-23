/* Backend "entry point" Express.js app with middleware and listening functionality.
Serves the API under /api and the built client (client/dist) for everything
else, so the whole app runs as one process on one origin. */

// Load environment variables from a local .env file, if there is one. This
// must stay the first import: later modules read process.env when loaded.
import 'dotenv/config';

// Import dependencies
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import morgan from "morgan";
import { client } from "./server/db/index.js";  // Import the database pool
import { ensureSchema } from "./server/db/schema.js";
import apiRouter from "./server/api/index.js"; // Router setup

const CLIENT_DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), "client", "dist");

// Middleware setup
const server = express(); // Initialize Express app
server.use(express.json()); // handle JSON requests
server.use(morgan("dev")); // Logging middleware to track requests in the console

// Liveness check: answers without touching the database
server.get("/healthz", (req, res) => res.send("ok"));

// Setup API routes
server.use("/api", apiRouter); // Mount the API router
server.use("/api", (req, res) => res.status(404).json({ message: "Not found" }));

// The built client, with index.html as the fallback for client-side routes
server.use(express.static(CLIENT_DIST));
server.get("*", (req, res) => res.sendFile(path.join(CLIENT_DIST, "index.html")));

// Error handling middleware (must come after route definitions)
server.use((err, req, res, next) => {
  console.error(err); // Log the error
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Create the tables if they do not exist yet; this also proves the database is reachable
const prepareDatabase = async () => {
  try {
    await ensureSchema(client);
    console.log("Database schema is ready");
  } catch (error) {
    console.error("Database setup error:", error);
    process.exit(1); // Exit if unable to connect
  }
};

// Server listening setup
const { PORT = 3000 } = process.env;
const startServer = () => {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`The server is up on port ${PORT}`);
  });
};

// Initialize the application
const init = async () => {
  await prepareDatabase();
  startServer();
};

// Invoke the init function
init();
