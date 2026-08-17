const prisma = require("../prisma/client");

const createHistory = async ({
  ticketId,
  userId,
  action,
  details,
}) => {
  await prisma.ticket_history.create({
    data: {
      ticket_id: ticketId,
      user_id: userId,
      action,
      details,
    },
  });
};

module.exports = {
  createHistory,
};