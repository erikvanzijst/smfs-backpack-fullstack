import express from "express";
import requireUser from "./utils.js";

import {
  getAllMemories,
  getMemoryById,
  getMemoriesByUser,
  createMemory,
  updateMemory,
  deleteMemory,
} from "../db/index.js"; // Change to ES Module import

// create Memories router
const memoriesRouter = express.Router();
memoriesRouter.use(express.json());

// GET ALL MEMORIES /api/memories/
memoriesRouter.get("/", async (req, res, next) => {
  try {
    const memories = await getAllMemories();
    res.send({
      memories,
    });
  } catch ({ ex }) {
    next({ ex });
  }
});

// GET MEMORIES BY ID http://localhost:3000/api/memories/:memoryId
memoriesRouter.get("/:memoryId", async (req, res, next) => {
  const { memoryId } = req.params; //access memoryId from req.params

  try {
    const memory = await getMemoryById(memoryId);

    res.send({
      memory,
    });
  } catch ({ ex }) {
    next({ ex });
  }
});

// GET MEMORIES BY USER ${API_URL}/memories/users/${userId}/memories
memoriesRouter.get("/users/:userId/memories", async (req, res, next) => {
  const { userId } = req.params;
  console.log("userid", userId);
  try {
    const memories = await getMemoriesByUser(userId);

    if (memories.length === 0) {
      return res
        .status(404)
        .json({ message: "No memories found for this user" });
    }
    res.send({ memories });
  } catch ({ ex }) {
    next({ ex });
  }
});
// this is a route function, "memories router"
// POST MEMORY (CREATE MEMORY) http://localhost:3000/api/memories
memoriesRouter.post("/", requireUser, async (req, res, next) => {
  const {
    title,
    imageUrl,
    description,
    dimension,
    // visibility, tags,
  } = req.body;

  // Initialize memoryData object
  const memoryData = {
    title,
    imageUrl,
    description,
    dimension,
    user_id: req.user.id
  };

  try {
    // Create the memory
    const memory = await createMemory(memoryData);

    if (memory) {
      res.send(memory); // Send the created memory
    } else {
      next({
        name: "Memory Creation Error",
        message: "Error in creating your memory. Please try resubmitting",
      });
    }
  } catch (error) {
    // Adjusted to catch a general error
    console.error("Error creating memory:", error);
    next({
      name: "InternalServerError",
      message: "An unexpected error occurred while creating memory",
    });
  }
});

// Only the memory's owner may change or delete it: responds and returns false
// otherwise, so the caller can bail out.
const checkOwnership = async (memoryId, req, res) => {
  const memory = await getMemoryById(memoryId);
  if (!memory) {
    res.status(404).send({ message: "Memory not found for this ID" });
    return false;
  }
  if (memory.user_id !== req.user.id) {
    res.status(403).send({ message: "You do not have permission to change this memory." });
    return false;
  }
  return true;
};

// PATCH MEMORY (PARTIALLY UPDATE MEMORY)
memoriesRouter.patch("/:memoryId", requireUser, async (req, res, next) => {
  const { memoryId } = req.params;
  const updates = req.body; // Get any properties provided in the request body

  try {
    if (!(await checkOwnership(memoryId, req, res))) return;
    const updatedMemory = await updateMemory(memoryId, updates);

    if (updatedMemory) {
      res.send(updatedMemory); // Send back the updated memory object
    } else {
      res.status(404).send({ message: "Memory not found for this ID" });
    }
  } catch (error) {
    console.error("Error updating memory:", error);
    next({ 
      name: "InternalServerError", 
      message: "An unexpected error occurred while updating the memory" 
    });
  }
});

// DELETE MEMORY BY ID
memoriesRouter.delete('/:id', requireUser, async (req, res) => {
  const { id } = req.params;

  try {
    if (!(await checkOwnership(id, req, res))) return;
    await deleteMemory(id);
    res.status(204).send(); // No Content - Successfully deleted
  } catch (error) {
    if (error.message.includes('does not exist')) {
      res.status(404).send({ error: error.message }); // Not Found
    } else {
      console.error('Error deleting memory:', error);
      res.status(500).send({ error: 'Failed to delete memory' });
    }
  }
});

export default memoriesRouter; // Export
