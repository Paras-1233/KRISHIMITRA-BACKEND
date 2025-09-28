import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  aadhar: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "buyer"], default: "buyer" },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
