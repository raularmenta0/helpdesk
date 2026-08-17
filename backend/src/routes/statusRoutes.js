const express = require("express");

const router = express.Router();

const {
  getStatuses
} = require("../controllers/statusController");

router.get("/", getStatuses);

module.exports = router;