const prisma = require("../prisma/client");

const getHistory = async (req, res) => {
  try {

    const ticketId = Number(req.params.id);

    const history =
      await prisma.ticket_history.findMany({
        where: {
          ticket_id: ticketId,
        },
        include: {
          users: true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

    res.json(history);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getHistory,
};