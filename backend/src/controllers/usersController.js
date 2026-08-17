const prisma = require("../prisma/client");

const getUsers = async (req, res) => {
  try {
    const users = await prisma.users.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.json(users);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

const getUserByClockNumber = async (req, res) => {
  try {

    const { clockNumber } = req.params;

    const user = await prisma.users.findFirst({
      where: {
        clock_number: clockNumber,
      },
      include: {
        areas: true,
        departments: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuario no encontrado",
      });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getUsers,
  getUserByClockNumber,
};