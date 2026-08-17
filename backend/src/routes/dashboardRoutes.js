const express = require("express");

const {
  getDashboard,
  getSatisfactionStats,
} = require("../controllers/dashboardController");

const router = express.Router();

/**
 * GET /dashboard
 * Estadísticas generales del dashboard
 */
router.get("/", getDashboard);

/**
 * GET /dashboard/satisfaction
 * Estadísticas de satisfacción
 */
router.get(
  "/satisfaction",
  getSatisfactionStats
);

module.exports = router;