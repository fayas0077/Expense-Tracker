const Expense = require("../models/expense");

// GET /api/expenses
exports.getAll = async (req, res) => {
  try {
    const items = await Expense.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
};

// POST /api/expenses
exports.create = async (req, res) => {
  try {
    const { title, amount, category, date } = req.body;
    if (!title || typeof amount === "undefined") {
      return res.status(400).json({ error: "title and amount are required" });
    }
    const expense = new Expense({
      title: String(title).trim(),
      amount: Number(amount),
      category: category || "other",
      date: date || new Date().toISOString().split("T")[0]
    });
    const saved = await expense.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create expense" });
  }
};

// DELETE /api/expenses/:id
exports.deleteOne = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Expense.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Expense not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete expense" });
  }
};

// DELETE /api/expenses  (clear all)
exports.deleteAll = async (req, res) => {
  try {
    await Expense.deleteMany({});
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear expenses" });
  }
};
