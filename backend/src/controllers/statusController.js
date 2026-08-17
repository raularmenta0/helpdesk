const prisma = require("../prisma/client");

const getStatuses = async (req, res) => {

  const statuses = await prisma.statuses.findMany();

  res.json(statuses);

};

module.exports = {
  getStatuses
};