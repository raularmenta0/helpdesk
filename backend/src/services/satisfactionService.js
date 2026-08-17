const prisma = require("../prisma/client");

/**
 * Obtiene una evaluación por ticket.
 */
const getSatisfactionByTicketId = async (ticketId) => {
  return prisma.ticket_surveys.findUnique({
    where: {
      ticket_id: ticketId,
    },
  });
};

/**
 * Guarda una evaluación de satisfacción.
 *
 * Cada ticket solamente puede tener una evaluación,
 * porque ticket_id es UNIQUE en la base de datos.
 */
const createSatisfaction = async ({
  ticketId,
  rating,
  comment,
}) => {
  const ticket = await prisma.tickets.findUnique({
    where: {
      id: ticketId,
    },
    include: {
      statuses: true,
    },
  });

  if (!ticket) {
    const error = new Error(
      "Ticket no encontrado"
    );

    error.statusCode = 404;

    throw error;
  }

  const statusName = String(
    ticket.statuses?.name || ""
  )
    .trim()
    .toLowerCase();

  if (statusName !== "resuelto") {
    const error = new Error(
      "El ticket debe estar resuelto para poder evaluarlo"
    );

    error.statusCode = 400;

    throw error;
  }

  const existingSurvey =
    await prisma.ticket_surveys.findUnique({
      where: {
        ticket_id: ticketId,
      },
    });

  if (existingSurvey) {
    const error = new Error(
      "Este ticket ya fue evaluado"
    );

    error.statusCode = 409;

    throw error;
  }

  return prisma.ticket_surveys.create({
    data: {
      ticket_id: ticketId,
      rating,
      comment: comment || null,
    },
  });
};

module.exports = {
  getSatisfactionByTicketId,
  createSatisfaction,
};