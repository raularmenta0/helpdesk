const express = require("express");

const router = express.Router();

const {
  getReports,
  exportExcel,
  exportPDF,
} = require(
  "../controllers/reportsController"
);

router.get(
  "/",
  getReports
);

router.get(
  "/export/excel",
  exportExcel
);

router.get(
  "/export/pdf",
  exportPDF
);

module.exports = router;