/* module contains CRUD mthds for db ops+ data management.
- Establishes a connection to the PostgreSQL database via pg module.
- Defines functions to interact with users and memories tables.
- Includes methods for managing favorites and tags.
- Exports db client and fn for use in seed.js, etc.
- configured for ES6 module syntax!!
*/

/* client setup, pg module using ES6 module syntax
- a connection pool rather than a single client: a pool replaces connections
  that drop (restarts, a pooler in front of the database), a Client never does
- connection string comes from DATABASE_URL, with a local development fallback
*/
import pkg from "pg"; // Import the entire pg module
const { Pool } = pkg; // Extract the Pool constructor
import { hash } from "bcrypt";
import { v4 } from "uuid";

// Columns that are safe to return to clients: never include the password hash.
const USER_COLUMNS = "id, username, dimension";

const client = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/smf",
});

// An idle connection that errors is discarded by the pool; without a listener
// the error would crash the process.
client.on("error", (error) => {
  console.error("Idle database connection error:", error.message);
});

/*DEFINED CRUD FUNCTIONS BELOW!! 
- user, memory, favorites, tags
*/

/* USER METHODS
on frontend: be explicit regarding what personal data you are collecting
 */

// Get All Users: Retrieves all users from the database.
const getAllUsers = async () => {
  try {
    const SQL = `SELECT ${USER_COLUMNS} FROM users`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.error("Error retrieving all users:", error);
    throw error;
  }
};

// Get User by ID: Retrieves a specific user by their ID.
const getUserById = async (id) => {
  try {
    const SQL = `SELECT ${USER_COLUMNS} FROM users WHERE id = $1`;
    const response = await client.query(SQL, [id]);
    return response.rows[0];
  } catch (error) {
    console.error("Error retrieving user by id:", error);
    throw error;
  }
};

// Includes the password hash: only for verifying credentials at login.
const getUserByUsername = async (username) => {
  try {
    const SQL =` SELECT * FROM users WHERE username = $1`;
    const response = await client.query(SQL, [username]); // Pass the username as an argument
    return response.rows[0];
  } catch (error) {
    console.error("Error retrieving user by username:", error);
    throw error;
  }
};

// Create User: Inserts a new user into the database with their information.
// removed email, display_name
const createUser = async ({ username, password, dimension }) => {
  try {
    const res = await client.query(
      `
      INSERT INTO users (username, password, dimension) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (username) DO NOTHING
      RETURNING ${USER_COLUMNS}
      `,
      [username, await hash(password, 10), dimension]
    );

    return res.rows[0]; // Return the newly created user
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// update User: only whitelisted columns can be changed; a new password is hashed.
const UPDATABLE_USER_FIELDS = ["username", "password", "dimension"];

const updateUser = async (id, fields) => {
  const updates = {};
  for (const key of UPDATABLE_USER_FIELDS) {
    if (fields[key] !== undefined) updates[key] = fields[key];
  }
  if (updates.password !== undefined) {
    updates.password = await hash(updates.password, 10);
  }
  if (Object.keys(updates).length === 0) {
    return getUserById(id);
  }

  const setString = Object.keys(updates)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(", ");

  const {
    rows: [user],
  } = await client.query(
    `
    UPDATE users
    SET ${setString}
    WHERE id=$${Object.keys(updates).length + 1}
    RETURNING ${USER_COLUMNS};
  `,
    [...Object.values(updates), id]
  );

  return user;
};


// Delete User: Removes a user from the database and returns the number of deleted rows.
const deleteUser = async (id) => {
  const result = await client.query(
    `
    DELETE FROM users
    WHERE id = $1;
  `,
    [id]
  );

  // Return the number of deleted rows.
  return result.rowCount; // This will be 1 if the user was deleted, 0 if not found.
};

/*  MEMORY METHODS */

// get all exisiting memories 
const getAllMemories = async () => {
  try {
    const SQL = `SELECT * FROM memories ORDER BY sort_order`;
    const response = await client.query(SQL);
    return response.rows;
  } catch (error) {
    console.error("Error retrieving all memories:", error);
    throw error;
  }
};

// get memory by id
const getMemoryById = async (memoryId) => {
  try {
    const SQL = `SELECT * FROM memories WHERE id = $1;`;
    const response = await client.query(SQL, [memoryId]);

    return response.rows[0]; // Return the memory
  } catch (error) {
    console.error();
    throw error;
  }
};

// get memories by User
const getMemoriesByUser = async (userId) => {
  try {
    const SQL = `
    SELECT * FROM memories 
    WHERE user_id = $1
    ORDER BY sort_order;`;
    // users ID is the foreign key
    // get users Id from user table and match it to 
    const response = await client.query(SQL, [userId]);

    return response.rows; // Return the list of memories associated with the user
  } catch (error) {
    console.error("Error retrieving memories by user:", error);
    throw error;
  }
};
// this is a model function, "memories model"
// it is redundant to pass 'id' as a prop bc we generate it w/in func using uuid
const createMemory = async ({
  // when passing user_id instead of userId as prop, the seeded data becomes null but the 
  // remotely submitted data gets successfully assigned to the user_id submitting the form.
  title, imageUrl, description, dimension, user_id
}) => {
  try {
    const id = v4(); // Generate a new UUID for the user
    const SQL = `
            INSERT INTO memories (id, title, image_url, description, dimension, user_id) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *;
        `;
    const response = await client.query(SQL, [
      id, title, imageUrl, description, dimension, user_id
    ]);
    return response.rows[0];
  } catch (error) {
    console.error("Error creating memory:", error);
    throw error;
  }
};

/* updates existing memory in db,
modifies fields based on CREATE TABLE memories
- memoryId, a unique idenitfier/ db row where update will take place
- updates, an obj containing new values updated from CREATE TABLE memories
*/

const updateMemory = async (memoryId, updates) => { // do i need to also pass user_id?
  try {
    const {
      title, imageUrl, description, dimension,
    } = updates;
    const fields = [];
    const values = [memoryId];
    let index = 1;

    // build the fields array only if updates are provided
    if (title) {
      fields.push(`title = $${++index}`);
      values.push(title);
    }
    if (description) {
      fields.push(`description = $${++index}`);
      values.push(description);
    }
    if (imageUrl) {
      fields.push(`image_url = $${++index}`);
      values.push(imageUrl);
    }
    if (dimension) {
      fields.push(`dimension = $${++index}`);
      values.push(dimension);
    }
    // if (user_id) {
    //   fields.push(`user_id = $${++index}`);
    //   values.push(user_id);
    // }

    // check if fields are up to date
    if (fields.length === 0) {
      return "No data was updated", null;
    }

    // Construct and Execute the memory update via SQL if there are fields to update
    const SQL = `
        UPDATE memories
        SET ${fields.join(", ")}
        WHERE id = $1
        RETURNING *;
      `;
    const response = await client.query(SQL, values);
    return response.rows[0]; // Return the updated memory
  } catch (error) {
    console.error("Error updating memory!", error);
    throw error("Could not update memory");
  }
};


// Delete Memory: Removes a memory from the database.
const deleteMemory = async (id) => {
  try {
    const result = await client.query(
    `
    DELETE FROM memories
    WHERE id = $1;
  `,
    [id]
  );
  if (result.rowCount === 0) {
    throw new Error(`Memory with ID ${id} does not exist.`);
  }
} catch (error) {
  console.error("Error deleting memory:", error);
  throw error; // Allow caller to handle it appropriately
};
}


export {
  client,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
  updateUser,
  deleteUser,

  getAllMemories,
  getMemoryById,
  getMemoriesByUser,
  createMemory,
  updateMemory,
  deleteMemory
};
