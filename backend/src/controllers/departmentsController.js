const prisma = require("../prisma/client");

const getDepartments = async (req, res) => {

  try {

    const departments = await prisma.departments.findMany({
      orderBy: {
        name: "asc"
      }
    });

    res.json(departments);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message
    });

  }

};

module.exports = {
  getDepartments
};