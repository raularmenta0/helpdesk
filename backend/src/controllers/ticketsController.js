// src/controllers/ticketsController.js

const prisma = require("../prisma/client");

const {
  sendTicketCreatedEmail,
  sendTicketStatusUpdatedEmail,
} = require("../services/outlookEmailService");

const {
  createHistory,
} = require("../services/historyService");

const REQUESTER_RELATION =
  "users_tickets_requester_idTousers";

/**
 * Convierte un valor a entero válido.
 */
const toInteger = (value) => {
  const number = Number(value);

  return Number.isInteger(number)
    ? number
    : null;
};

/**
 * Envía el correo de creación sin bloquear
 * la respuesta de la API.
 */
const sendCreatedEmailInBackground = ({
  email,
  ticket,
}) => {
  if (!email) {
    console.warn(
      `El ticket ${ticket.ticket_number} no tiene correo de solicitante`
    );

    return;
  }

  Promise.resolve()
    .then(() =>
      sendTicketCreatedEmail({
        email,
        ticketNumber: ticket.ticket_number,
        category: ticket.categories?.name,
        priority: ticket.priorities?.name,
        description: ticket.description,
      })
    )
    .then(() => {
      console.log(
        `Correo de creación enviado correctamente a ${email}`
      );
    })
    .catch((error) => {
      console.error(
        `El ticket ${ticket.ticket_number} fue creado, pero el correo no pudo enviarse:`,
        error.message
      );
    });
};

/**
 * Envía el correo de cambio de estado sin bloquear
 * la respuesta de la API.
 */
const sendStatusEmailInBackground = ({
  email,
  ticket,
}) => {
  if (!email) {
    console.warn(
      `El ticket ${ticket.ticket_number} no tiene correo de solicitante`
    );

    return;
  }

  Promise.resolve()
    .then(() =>
      sendTicketStatusUpdatedEmail({
        email,
        ticketNumber: ticket.ticket_number,
        status: ticket.statuses?.name,
      })
    )
    .then(() => {
      console.log(
        `Correo de actualización enviado correctamente a ${email}`
      );
    })
    .catch((error) => {
      console.error(
        `El estado del ticket ${ticket.ticket_number} se actualizó, pero el correo no pudo enviarse:`,
        error.message
      );
    });
};

/**
 * LISTAR TICKETS
 */
const getTickets = async (req, res) => {
  try {
    const {
      status_id,
      user_id,
    } = req.query;

    const where = {};

    if (
      status_id !== undefined &&
      status_id !== ""
    ) {
      const statusId = toInteger(status_id);

      if (statusId === null) {
        return res.status(400).json({
          error:
            "status_id debe ser un número entero válido",
        });
      }

      where.status_id = statusId;
    }

    if (
      user_id !== undefined &&
      user_id !== ""
    ) {
      const userId = toInteger(user_id);

      if (userId === null) {
        return res.status(400).json({
          error:
            "user_id debe ser un número entero válido",
        });
      }

      where.requester_id = userId;
    }

    const tickets =
      await prisma.tickets.findMany({
        where,
        orderBy: {
          id: "desc",
        },
        include: {
          statuses: true,
          priorities: true,
          categories: true,
          areas: true,
          departments: true,
          [REQUESTER_RELATION]: true,
          survey: true,
        },
      });

    return res.json(tickets);
  } catch (error) {
    console.error(
      "Error listando tickets:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * OBTENER TICKET POR ID
 */
const getTicketById = async (req, res) => {
  try {
    const ticketId = toInteger(
      req.params.id
    );

    if (ticketId === null) {
      return res.status(400).json({
        error: "El ID del ticket no es válido",
      });
    }

    const ticket =
      await prisma.tickets.findUnique({
        where: {
          id: ticketId,
        },
        include: {
          statuses: true,
          priorities: true,
          categories: true,
          areas: true,
          departments: true,
          [REQUESTER_RELATION]: true,
          survey: true,
        },
      });

    if (!ticket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    return res.json(ticket);
  } catch (error) {
    console.error(
      "Error obteniendo ticket:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * CREAR TICKET
 */
const createTicket = async (req, res) => {
  try {
    const {
      requester_id,
      area_id,
      department_id,
      category_id,
      subject,
      description,
      priority_id,
      status_id,
    } = req.body;

    const requesterId =
      toInteger(requester_id);

    const areaId =
      toInteger(area_id);

    const departmentId =
      toInteger(department_id);

    const categoryId =
      toInteger(category_id);

    const priorityId =
      toInteger(priority_id);

    const statusId =
      toInteger(status_id);

    if (
      requesterId === null ||
      areaId === null ||
      departmentId === null ||
      categoryId === null ||
      priorityId === null ||
      statusId === null
    ) {
      return res.status(400).json({
        error:
          "requester_id, area_id, department_id, category_id, priority_id y status_id deben ser números enteros válidos",
      });
    }

    if (
      typeof subject !== "string" ||
      !subject.trim()
    ) {
      return res.status(400).json({
        error: "El asunto es obligatorio",
      });
    }

    if (
      typeof description !== "string" ||
      !description.trim()
    ) {
      return res.status(400).json({
        error: "La descripción es obligatoria",
      });
    }

    const requester =
      await prisma.users.findUnique({
        where: {
          id: requesterId,
        },
        select: {
          id: true,
          email: true,
        },
      });

    if (!requester) {
      return res.status(404).json({
        error:
          "El usuario solicitante no existe",
      });
    }

    const lastTicket =
      await prisma.tickets.findFirst({
        where: {
          ticket_number: {
            not: null,
          },
        },
        orderBy: {
          id: "desc",
        },
      });

    let nextNumber = 1;

    if (lastTicket?.ticket_number) {
      const currentNumber = parseInt(
        lastTicket.ticket_number.replace(
          "HD-",
          ""
        ),
        10
      );

      if (!Number.isNaN(currentNumber)) {
        nextNumber = currentNumber + 1;
      }
    }

    const ticketNumber =
      `HD-${String(nextNumber).padStart(
        6,
        "0"
      )}`;

    const ticket =
      await prisma.tickets.create({
        data: {
          ticket_number: ticketNumber,
          requester_id: requesterId,
          area_id: areaId,
          department_id: departmentId,
          category_id: categoryId,
          subject: subject.trim(),
          description: description.trim(),
          priority_id: priorityId,
          status_id: statusId,
          source: "WEB",
        },
        include: {
          statuses: true,
          priorities: true,
          categories: true,
          areas: true,
          departments: true,
          [REQUESTER_RELATION]: true,
        },
      });

    await createHistory({
      ticketId: ticket.id,
      userId: requesterId,
      action: "Ticket Creado",
      details:
        `Ticket ${ticket.ticket_number} creado`,
    });

    /*
     * Primero respondemos al frontend.
     * Outlook se ejecuta después sin dejar
     * la petición pendiente.
     */
    res.status(201).json(ticket);

    sendCreatedEmailInBackground({
      email: requester.email,
      ticket,
    });
  } catch (error) {
    console.error(
      "Error creando ticket:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * ACTUALIZAR ESTADO DEL TICKET
 */
const updateTicketStatus = async (
  req,
  res
) => {
  try {
    const ticketId = toInteger(
      req.params.id
    );

    const statusId = toInteger(
      req.body.status_id
    );

    if (ticketId === null) {
      return res.status(400).json({
        error: "El ID del ticket no es válido",
      });
    }

    if (statusId === null) {
      return res.status(400).json({
        error:
          "status_id debe ser un número entero válido",
      });
    }

    const currentTicket =
      await prisma.tickets.findUnique({
        where: {
          id: ticketId,
        },
        include: {
          statuses: true,
          [REQUESTER_RELATION]: true,
        },
      });

    if (!currentTicket) {
      return res.status(404).json({
        error: "Ticket no encontrado",
      });
    }

    const ticket =
      await prisma.tickets.update({
        where: {
          id: ticketId,
        },
        data: {
          status_id: statusId,
          updated_at: new Date(),
        },
        include: {
          statuses: true,
          priorities: true,
          categories: true,
          areas: true,
          departments: true,
          [REQUESTER_RELATION]: true,
          survey: true,
        },
      });

    await createHistory({
      ticketId,
      userId: null,
      action: "Cambio Estado",
      details:
        `${currentTicket.statuses?.name || "Sin estado"} → ${
          ticket.statuses?.name || "Sin estado"
        }`,
    });

    const requester =
      ticket[REQUESTER_RELATION];

    /*
     * Primero respondemos al frontend.
     * El correo se envía en segundo plano.
     */
    res.json(ticket);

    sendStatusEmailInBackground({
      email: requester?.email,
      ticket,
    });
  } catch (error) {
    console.error(
      "Error actualizando estado del ticket:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

/**
 * OBTENER LOS ÚLTIMOS TICKETS
 */
const getLatestTickets = async (
  req,
  res
) => {
  try {
    const tickets =
      await prisma.tickets.findMany({
        take: 5,
        orderBy: {
          id: "desc",
        },
        include: {
          statuses: true,
          priorities: true,
          categories: true,
          areas: true,
          departments: true,
          [REQUESTER_RELATION]: true,
          survey: true,
        },
      });

    return res.json(tickets);
  } catch (error) {
    console.error(
      "Error obteniendo últimos tickets:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicketStatus,
  getLatestTickets,
};