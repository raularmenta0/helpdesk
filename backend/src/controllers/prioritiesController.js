const prisma = require("../prisma/client");

const getPriorities = async (req, res) => {

  try {

    const priorities = await prisma.priorities.findMany();

    res.json(priorities);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  getPriorities
};