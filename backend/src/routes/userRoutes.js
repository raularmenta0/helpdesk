const express = require("express");

const router = express.Router();

const {
  getUsers,
  getUserByClockNumber,
} = require("../controllers/usersController");

router.get("/", getUsers);

router.get(
  "/clock/:clockNumber",
  getUserByClockNumber
);

module.exports = router;