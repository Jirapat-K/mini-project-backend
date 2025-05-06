import { User } from "../../../../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json({ error: false, users });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Failed to fetch users",
            details: err.message,
        });
    }
};

// Update fullName
export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    // console.log(req, "test");

    try {
        const updatedUser = await User.findByIdAndUpdate(id, updates, {
            new: true,
        });
        if (!updatedUser) return res.status(404).json("User not found");
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error",
        });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    // console.log("testdelete", req);
    try {
        const deleteUser = await User.findByIdAndDelete(id);
        if (deleteUser) {
            res.status(200).json("User Delete successfully");
        }
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error",
        });
    }
};

//Create a user

export const createAllUsers = async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({
            error: true,
            message: "All fields (fullName, email, password) are required!",
        });
    }
    try {
        const existing = await User.findOne({
            $or: [{ email }, { fullName }],
        });
        if (existing) {
            return res.status(409).json({
                error: true,
                message: "Email or fullName already in use!",
            });
        }
        if (password.length < 6 || password.length > 30) {
            return res.status(400).json({
                error: true,
                message: "Password must be at least 6 characters long!",
            });
        }
        if (!/\d/.test(password)) {
            return res.status(400).json({
                error: true,
                message: "Password must contain at least one number!",
            });
        }
        //create and save new user
        const user = new User({ fullName, email, password });
        await user.save();

        return res.status(201).json({
            error: false,
            user,
            message: "user created successfully",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: "Server error",
            details: error.message,
        });
    }
};

// Register a new user
export const registerUser = async (req, res) => {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({
            error: true,
            message: "All fields are required",
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
            error: true,
            message: "Password must be at least 6 characters long",
        });
    }
    try {
        const existingUser = await User.findOne({
            email
        });
        // console.log( existingUser)
        if (existingUser) {
            return res.status(409).json({
                error: true,
                message: "Email already in use.",
            });
        }
        const user = new User({ fullName, email, password });
        await user.save();

        res.status(201).json({
            error: false,
            message: "Created user successful!",
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error",
            details: err.message,
        });
    }
};

//login a user
export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({
            error: true,
            message: "Email and password are required.",
        });
    }

    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({
                error: true,
                message: "Invalid credentials",
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        // console.log(isMatch);
        if (!isMatch) {
            return res.status(401).json({
                error: true,
                message: "Invalid credentials",
            });

        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });


        return res.json({
            error: false,
            token,
            message: "Login successful!",
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Server error",
            details: err.message,
        });
    }
};

// Login a user - jwt signed token
export const loginCookieUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: true, message: "Email and password are required." });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: true, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: true, message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        const isProd = process.env.NODE_ENV === "production";
        res.cookie("accessToken", token, {
            httpOnly: true,
            secure: isProd, // only send over HTTPS in prod
            sameSite: isProd ? "none" : "lax",
            path: "/",
            maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.status(200).json({
            error: false,
            message: "Login successful via cookie",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
            },
        });
    } catch (err) {
        res.status(500).json({ error: true, message: "Server error", details: err.message });
    }
};

// Get Profile User
export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.user._id;
        const userProfile = await User.findById(userId).select("-password");
        if (!userProfile) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.json({
            error: false,
            user: userProfile,
            message: "User profile retrieved successfully!",
        });
    } catch (err) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error",
            details: err.message,
        });
    }
};

//Logout
export const logoutUser = (req, res) => {
    res.clearCookie("accessToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
    });
    res.status(200).json({ error: false, message: "Logged out successfully" });
};

// Verify Token
export const verifyToken = (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: true, message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            error: false,
            userId: decoded.userId,
            message: "Token is valid",
        });
    } catch (err) {
        res.status(401).json({ error: true, message: "Invalid token" });
    }
};