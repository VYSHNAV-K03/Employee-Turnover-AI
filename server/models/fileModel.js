const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filePath: String,
  fileName: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  uploadedDate: { type: Date, default: Date.now },
});
const File = mongoose.model("File", fileSchema);

module.exports = File;
