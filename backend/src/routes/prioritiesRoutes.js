const express = require("express");

const router = express.Router();

const {
  getPriorities
} = require("../controllers/prioritiesController");

router.get("/", getPriorities);

module.exports = router;