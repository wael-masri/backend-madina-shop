const express = require("express");

const { protect, allowedTo } = require("../controllers/authControllers");
const {
  updateKanban, createKanban, getKanban,
} = require("../controllers/kanbanControllers");

const router = express.Router();

//ROUTES
router.get("/", getKanban);
router.post("/", createKanban);
router.put("/", updateKanban);

module.exports = router;
