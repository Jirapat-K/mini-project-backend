import { Schema, model } from "mongoose";

const NotesSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
    isPinned: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    createdOn: { type: Date, default: Date.now },

},
    {
        timestamps: true,
    }
);

export const Note = model("Note", NotesSchema);