import { Note } from "../../../../models/Note.js";
import { User } from "../../../../models/User.js";
import mongoose from "mongoose";

//get all note
export const getAllNotes = async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1, isPinned: -1 });
        return res.status(200).json({
            error: false,
            notes,
            message: "All notes retrieved successfully"
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Failed to fetch all notes",
            details: err.message
        });
    }
};
//Create a note
export const createNote = async (req, res) => {
    const { title, content, tags = [], isPinned = false, userId } = req.body;

    if (!title || !content || !userId) {
        return res.status(400).json({
            error: true,
            message: "Title, content, and userId are required"
        });
    }
    try {
        const note = await Note.create({
            title,
            content,
            tags,
            isPinned,
            userId,
        });

        return res.status(201).json({
            error: false,
            note,
            message: "Note created successfully"
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Failed to create note",
            details: err.message
        });
    }
};

// Add Note
export const addNote = async (req, res) => {
    const { title, content, tags = [], isPinned = false } = req.body;

    const userId = req.user.user._id;
    //console.log(userId)
    

    if (!title || !content) {
        return res.status(400).json({
            error: true,
            message: "All fields required!",
        });
    }

    if (!userId) {
        return res.status(400).json({
            error: true,
            message: "Invalid user credentials!",
        });
    }

    try {
        const note = await Note.create({
            title,
            content,
            tags,
            isPinned,
            userId,
        });
        // console.log(note)

        // await note.save();
        // console.log(note.save());
        return res.json({
            error: false,
            note,
            message: "Note added successfully!",
        });
    } catch (err) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};

// Edit Note
export const editNote = async (req, res) => {

    const { noteId } = req.params;
    const { title, content, tags, isPinned } = req.body;
    const { user } = req.user;

    if (!title || !content) {
        return res.status(400).json({
            error: true,
            message: "Nochanges provided",
        });
    }
    try {
        const note = await Note.findOne({ _id: noteId, userId: user._id });
        if (!note) {
            return res.status(404).json({
                error: true,
                message: "Note not fond",
            });
        }

        if (title) note.title = title;
        if (content) note.content = content;
        if (tags) note.tags = tags;
        if (isPinned) note.isPinned = true;

        await note.save(note);

        return res.json({
            error: false,
            note,
            message: "Note updated successfully",
        });
    } catch (error) {
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};

//Update isPinned
export const togglePin = async (req, res) => {
    const { noteId } = req.params;
    const { isPinned } = req.body;
    try {
        const updatedNote = await Note.findByIdAndUpdate(
            noteId,
            { isPinned },
            { new: true }
        );
        if (!updatedNote) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }
        res.json({ error: false, note: updatedNote, message: "Note pinned status updated!" });
    } catch (err) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

//Get notes by user
export const getUserNotes = async (req, res) => {
    const { user } = req.user;
    // console.log(user);
    try {
        const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
        res.json({
            err: false,
            notes,
            message: "All notes retreived!",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};

//Delete note
export const deleteUserNote = async (req, res) => {
    const { noteId } = req.params;
    try {
        const deletedNote = await Note.findByIdAndDelete(noteId);
        if (!deletedNote) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }
        res.json({ error: false, message: "Note deleted successfully!" });
    } catch (err) {
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

//Search note
export const searchNote = async (req, res) => {
    const { user } = req.user;
    const { query } = req.query;
    if (!query) {
        return res
            .status(400)
            .json({ error: true, message: "Search query is required!" });
    }
    try {
        const matchingNotes = await Note.find({
            userId: user._id,
            $or: [
                { title: { $regex: new RegExp(query, "i") } },
                { content: { $regex: new RegExp(query, "i") } },
            ],
        });
        res.json({
            error: false,
            notes: matchingNotes,
            message: "Notes matching the search query retrieved success!",
        });
    } catch (error) {
        res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};

//
export const getNoteById = async (req, res) => {
    const noteId = req.params.noteId;
    const { user } = req.user;

    try {
        // Find the note by ID and ensure it belongs to the logged-in user
        const note = await Note.findOne({ _id: noteId, userId: user._id });

        if (!note) {
            return res.status(404).json({ error: true, message: "Note not found" });
        }

        return res.json({
            error: false,
            note,
            message: "Note retrieved successfully",
        });
    } catch (error) {
        console.error("Error fetching note:", error);
        return res.status(500).json({
            error: true,
            message: "Internal Server Error",
        });
    }
};
export const publicNoteUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select(
            "fullName email"
        );
        if (!user) {
            return res.status(404).json({ error: true, message: "User not found" });
        }
        res.status(200).json({ error: false, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};

export const publicNoteUser = async (req, res) => {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: true, message: "Invalid user ID" });
    }

    try {
        const notes = await Note.find({
            userId,
            isPublic: true, // Only fetch public notes
        }).sort({ createdOn: -1 }); // Sort by creation date (newest first)

        res.status(200).json({ error: false, notes });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};

export const updateNoteVisibility = async (req, res) => {
    const { isPublic } = req.body;
    const { user } = req.user;

    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.noteId, userId: user._id }, // Ensure the note belongs to the user
            { isPublic },
            { new: true } // Return the updated note
        );

        if (!note) {
            return res
                .status(404)
                .json({ error: true, message: "Note not found or unauthorized" });
        }

        res.status(200).json({ error: false, note });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: true, message: "Server error" });
    }
};
