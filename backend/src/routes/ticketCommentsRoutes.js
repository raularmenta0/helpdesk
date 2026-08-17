const express = require("express");

const router = express.Router();

const {
  getComments,
  createComment,
} = require(
  "../controllers/ticketCommentsController"
);

router.get(
  "/:id/comments",
  getComments
);

router.post(
  "/:id/comments",
  createComment
);

module.exports = router;