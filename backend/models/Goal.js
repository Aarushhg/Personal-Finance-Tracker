import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  savedAmount: { type: Number, default: 0 }, // progress
  deadline: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Goal", goalSchema);
