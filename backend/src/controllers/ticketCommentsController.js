const prisma = require("../prisma/client");

/**
 * OBTENER COMENTARIOS DE UN TICKET
 */
const getComments = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);

    const comments = await prisma.ticket_comments.findMany({
      where: {
        ticket_id: ticketId,
      },
      include: {
        users: true,
      },
      orderBy: {
        created_at: "asc",
      },
    });

    res.json(comments);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

/**
 * CREAR COMENTARIO
 */
const createComment = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);

    const {
      user_id,
      comment,
    } = req.body;

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        error: "El comentario es obligatorio",
      });
    }

    const newComment =
      await prisma.ticket_comments.create({
        data: {
          ticket_id: ticketId,
          user_id: Number(user_id),
          comment,
        },
      });

    res.status(201).json(newComment);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getComments,
  createComment,
};