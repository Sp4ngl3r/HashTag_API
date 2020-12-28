import mongoose from "mongoose";

const hashtagSchema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
  received: Boolean,
});

export default mongoose.model("messagecontents", hashtagSchema);
