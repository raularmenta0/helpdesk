const express = require("express");

const router = express.Router();

const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  getLatestTickets
} = require("../controllers/ticketsController");

router.get("/", getTickets);

router.get("/latest", getLatestTickets);

router.get("/:id", getTicketById);

router.post("/", createTicket);

router.put("/:id/status", updateTicketStatus);

module.exports = router;