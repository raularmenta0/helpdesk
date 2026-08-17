const express = require("express");

const router = express.Router();

const {
  getDepartments
} = require("../controllers/departmentsController");

router.get("/", getDepartments);

module.exports = router;