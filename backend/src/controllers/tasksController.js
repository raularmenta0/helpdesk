const prisma = require("../prisma/client");

const getTasks = async (req, res) => {
  try {

    const tasks =
      await prisma.tasks.findMany({
        orderBy: {
          id: "desc",
        },
      });

    res.json(tasks);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

const createTask = async (req, res) => {
  try {

    const {
      title,
      description,
    } = req.body;

    const task =
      await prisma.tasks.create({
        data: {
          title,
          description,
        },
      });

    res.status(201).json(task);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

const toggleTask = async (req, res) => {
  try {

    const task =
      await prisma.tasks.findUnique({
        where: {
          id: Number(req.params.id),
        },
      });

    if (!task) {
      return res.status(404).json({
        error: "Tarea no encontrada",
      });
    }

    const updatedTask =
      await prisma.tasks.update({
        where: {
          id: task.id,
        },
        data: {
          completed:
            !task.completed,
        },
      });

    res.json(updatedTask);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

const deleteTask = async (req, res) => {
  try {

    await prisma.tasks.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({
      message:
        "Tarea eliminada",
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getTasks,
  createTask,
  toggleTask,
  deleteTask,
};