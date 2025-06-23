const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model("Employee", employeeSchema);
