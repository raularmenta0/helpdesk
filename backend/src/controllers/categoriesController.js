const prisma = require("../prisma/client");

const getCategories = async (req, res) => {

  try {

    const categories = await prisma.categories.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.json(categories);

  } catch (error) {

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  getCategories
};