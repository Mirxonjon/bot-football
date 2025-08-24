const { Schema, model } = require("mongoose");

const Users = new Schema({
  chat_id: String,
  action: String,
  username: String,
  language: String,
  phone: String,
    cardNumber: {
        type: String,
        default: "1234 5678 9012 3456",
  },
  admin: {
    type: Boolean,
    default: false, // admin bormi
  },
  access: {
    type: Boolean,
    default: false, // kanalga kirish huquqi bormi
  },
  join: {
    type: Boolean,
    default: false, // kanalga kirish huquqi bormi
  },
  plan: {
    type: String,
  },
  subscriptionStart: {
    type: Date,
  },
  subscriptionEnd: {
    type: Date,
  },
  totalPaid: {
    type: Number,
    default: 0,
  },
  updateAt: Date,
  createdAt: Date,
});

module.exports = model("Users", Users);
