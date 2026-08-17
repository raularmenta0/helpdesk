const prisma = require("../prisma/client");

const getAreas = async (req, res) => {

  try {

    const areas = await prisma.areas.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.json(areas);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  getAreas
};