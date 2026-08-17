const express = require("express");

const router = express.Router();

const {
  getHistory,
} = require(
  "../controllers/ticketHistoryController"
);

router.get(
  "/:id/history",
  getHistory
);

module.exports = router;