/* module contains CRUD mthds for db ops+ data management.
- Establishes a connection to the PostgreSQL database via pg module.
- Defines functions to interact with users and memories tables.
- Includes methods for managing favorites and tags.
- Exports db client and fn for use in seed.js, etc.
- configured for ES6 module syntax!!
*/

/* client setup, pg module using ES6 module syntax
- contains Client constructor
- connection string config'd to use env var for db URL w/ fallback string if the var is NULL/not defined
- ssl config that alters based on app's env (production vs dev) to show secure connection dynamic handling
*/
import pkg from "pg"; // Import the entire pg module
const { Client } = pkg; // Extract the Client constructor
import { hash } from "bcrypt";
import { v4 } from "uuid";
import jwt from "jsonwebtoken"; // for creating or managing tokens related to user actions.
const JWT_SECRET = process.env.JWT_SECRET || "shhh";

const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://ealejo@localhost:5432/schrodingers_backpack",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : undefined,
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
    const SQL = `SELECT * FROM users`;
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
    const SQL = `SELECT * FROM users WHERE id = $1`;
    const response = await client.query(SQL, [id]);
    return response.rows[0];
  } catch (error) {
    console.error("Error retrieving user by id:", error);
    throw error;
  }
};

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
  const id = v4(); // Generate a new UUID for the user
  const hashedPassword = await hash(password, 10); // Hash the password

  try {
    const res = await client.query(
      `
      INSERT INTO users (username, password, dimension) 
      VALUES ($1, $2, $3) 
      ON CONFLICT (username) DO NOTHING
      RETURNING *
      `,
      [username, await hash(password, 10), dimension]
    );

    return res.rows[0]; // Return the newly created user
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

// update User
const updateUser = async (id, fields) => {
  const setString = Object.keys(fields)
    .map((key, index) => {
      return `"${key}"=$${index + 1}`;
    })
    .join(", ");

  const {
    rows: [user],
  } = await client.query(
    `
    UPDATE users
    SET ${setString}
    WHERE id=$${Object.keys(fields).length + 1}
    RETURNING *;
  `,
    [...Object.values(fields), id]
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
    const SQL = `SELECT * FROM memories`;
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
    WHERE user_id = $1;`;
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
