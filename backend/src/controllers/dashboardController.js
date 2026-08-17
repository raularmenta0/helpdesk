const prisma = require("../prisma/client");

const getDashboard = async (req, res) => {

  const total =
    await prisma.tickets.count();

  const nuevos =
    await prisma.tickets.count({
      where: {
        status_id: 1,
      },
    });

  const enProceso =
    await prisma.tickets.count({
      where: {
        status_id: 3,
      },
    });

  const realizados =
    await prisma.tickets.count({
      where: {
        status_id: 6,
      },
    });

  const vencidos =
    await prisma.tickets.count({
      where: {
        status_id: 9,
      },
    });

  res.json({
    total,
    nuevos,
    enProceso,
    realizados,
    vencidos,
  });

};

const getSatisfactionStats = async (req, res) => {
  try {
    const groupedRatings =
      await prisma.ticket_surveys.groupBy({
        by: ["rating"],
        _count: {
          rating: true,
        },
        orderBy: {
          rating: "asc",
        },
      });

    const aggregate =
      await prisma.ticket_surveys.aggregate({
        _avg: {
          rating: true,
        },
        _count: {
          rating: true,
        },
      });

    const distribution = [1, 2, 3, 4, 5].map(
      (rating) => {
        const found = groupedRatings.find(
          (item) => item.rating === rating
        );

        return {
          rating,
          total: found?._count?.rating || 0,
        };
      }
    );

    return res.json({
      average: Number(
        (aggregate._avg.rating || 0).toFixed(2)
      ),
      total: aggregate._count.rating || 0,
      distribution,
    });
  } catch (error) {
    console.error(
      "Error obteniendo estadísticas de satisfacción:",
      error
    );

    return res.status(500).json({
      error: error.message,
    });
  }
};

module.exports = {
  getDashboard,
  getSatisfactionStats,
};