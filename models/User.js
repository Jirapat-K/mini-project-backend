import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';

// Create schema
const UserSchema = new Schema({
    fullName: {
        type: String,
        require: true,
        unique: true,
        minlength: 3,
        maxlength: 30,
    },
    email: { type: String },
    password: { type: String, required: true, minlength: 6 },
    createdOn: { type: Date, default: new Date().getTime() },
});
// Hash password before saving
UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
export const User = model("User", UserSchema);
