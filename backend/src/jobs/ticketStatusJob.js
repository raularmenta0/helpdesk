const cron = require("node-cron");

const prisma = require("../prisma/client");

const startTicketStatusJob = () => {

  cron.schedule("*/5 * * * *", async () => {

    console.log(
      "Verificando estados automáticos..."
    );

    try {

      //
      // NUEVO -> EN PROCESO
      // DESPUÉS DE 10 MINUTOS
      //
      await prisma.$executeRaw`

        UPDATE tickets
        SET status_id = 3

        WHERE status_id = 1

        AND created_at <=
        NOW() - INTERVAL '5 minutes'

      `;

      //
      // NUEVO / EN PROCESO
      // -> VENCIDO
      // DESPUÉS DE 3 DÍAS
      //
      await prisma.$executeRaw`

        UPDATE tickets
        SET status_id = 9

        WHERE status_id IN (1,3)

        AND created_at <=
        NOW() - INTERVAL '3 days'

      `;

    } catch (error) {

      console.error(
        "Error Job Tickets:",
        error
      );

    }

  });

};

module.exports = {
  startTicketStatusJob,
};