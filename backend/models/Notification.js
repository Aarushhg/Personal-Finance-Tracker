import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true }, // "bill", "goal", "budget"
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  relatedId: { type: mongoose.Schema.Types.ObjectId }, // optional link to transaction/goal/budget
});

export default mongoose.model("Notification", notificationSchema);
