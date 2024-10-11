const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date()
  },
  updated_at: {
    type: Date,
    required: true,
    default: new Date()
  },
});

const EmployeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  salary: {
    type: Number,
    required: true
  },
  date_of_joining: {
    type: Date,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    required: true,
    default: new Date()
  },
  updated_at: {
    type: Date,
    required: true,
    default: new Date()
  }
});

const User = mongoose.model("user", UserSchema);
const Employee = mongoose.model("Employee", EmployeeSchema);

module.exports = { User, Employee };
