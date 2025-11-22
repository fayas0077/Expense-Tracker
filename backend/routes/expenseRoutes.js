const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/expenseController");

router.get("/", ctrl.getAll);
router.post("/", ctrl.create);
router.delete("/:id", ctrl.deleteOne);
router.delete("/", ctrl.deleteAll);

module.exports = router;
