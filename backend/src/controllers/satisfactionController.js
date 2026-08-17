const {
  getSatisfactionByTicketId,
  createSatisfaction,
} = require("../services/satisfactionService");

const toInteger = (value) => {
  const number = Number(value);

  return Number.isInteger(number)
    ? number
    : null;
};

/**
 * OBTENER EVALUACIÓN DE UN TICKET
 */
const getTicketSatisfaction = async (
  req,
  res
) => {
  try {
    const ticketId = toInteger(
      req.params.id
    );

    if (ticketId === null) {
      return res.status(400).json({
        error: "El ID del ticket no es válido",
      });
    }

    const satisfaction =
      await getSatisfactionByTicketId(ticketId);

    return res.json({
      evaluated: Boolean(satisfaction),
      satisfaction,
    });
  } catch (error) {
    console.error(
      "Error obteniendo satisfacción:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * CREAR EVALUACIÓN DE SATISFACCIÓN
 */
const createTicketSatisfaction = async (
  req,
  res
) => {
  try {
    const ticketId = toInteger(
      req.params.id
    );

    const rating = toInteger(
      req.body.rating
    );

    const { comment } = req.body;

    if (ticketId === null) {
      return res.status(400).json({
        error: "El ID del ticket no es válido",
      });
    }

    if (
      rating === null ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        error:
          "La calificación debe ser un número entero entre 1 y 5",
      });
    }

    if (
      comment !== undefined &&
      comment !== null &&
      typeof comment !== "string"
    ) {
      return res.status(400).json({
        error: "El comentario debe ser texto",
      });
    }

    const satisfaction =
      await createSatisfaction({
        ticketId,
        rating,
        comment:
          typeof comment === "string"
            ? comment.trim()
            : null,
      });

    return res.status(201).json({
      message:
        "Evaluación guardada correctamente",
      satisfaction,
    });
  } catch (error) {
    console.error(
      "Error creando satisfacción:",
      error
    );

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Este ticket ya fue evaluado",
      });
    }

    return res.status(
      error.statusCode || 500
    ).json({
      error: error.message,
    });
  }
};

module.exports = {
  getTicketSatisfaction,
  createTicketSatisfaction,
};