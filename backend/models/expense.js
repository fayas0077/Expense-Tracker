const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ["food", "transport", "shopping", "bills", "entertainment", "other"],
    default: "other"
  },
  date: { type: String, required: true }, // keep as ISO date string (YYYY-MM-DD)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Expense", ExpenseSchema);
