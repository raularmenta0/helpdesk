const express = require("express");

const {
  getTicketSatisfaction,
  createTicketSatisfaction,
} = require("../controllers/satisfactionController");

console.log(
  "satisfactionRoutes.js cargado correctamente"
);

const router = express.Router();

router.get(
  "/:id/satisfaction",
  getTicketSatisfaction
);

router.post(
  "/:id/satisfaction",
  createTicketSatisfaction
);

module.exports = router;