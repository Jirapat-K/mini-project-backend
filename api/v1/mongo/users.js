import express from "express";
import {
    createAllUsers,
    getAllUsers,
    updateUser,
    deleteUser,
    registerUser,
    loginUser,
    loginCookieUser,
    getUserProfile,
    logoutUser,
    verifyToken
} from "./controllers/usersController.js";
import { authUser } from "../../../middleware/auth.js";


const router = express.Router();

// get all users
router.get("/users", getAllUsers);

// Create a user
router.post("/users", createAllUsers);

// Update a user
router.put("/users/:id", updateUser);

// Delete a user
router.delete("/users/:id", deleteUser);

// Register a new user
router.post("/auth/register", registerUser);

//login a user
router.post("/auth/login", loginUser);

// Login a user - jwt signed token
router.post("/auth/cookie/login", loginCookieUser);

// Get Profile User
router.get("/auth/profile", authUser, getUserProfile);

//Logout
router.post("/auth/logout", logoutUser);

// Verify Token
router.get("/auth/verify", verifyToken);

export default router;
