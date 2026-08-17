const prisma = require("../prisma/client");

const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

const getReports = async (req, res) => {
  try {

    const {
      startDate,
      endDate,
    } = req.query;

    const where = {};

    if (startDate && endDate) {
      where.created_at = {
        gte: new Date(startDate),
        lte: new Date(
          `${endDate}T23:59:59`
        ),
      };
    }

    const total =
      await prisma.tickets.count({
        where,
      });

    const nuevos =
      await prisma.tickets.count({
        where: {
          ...where,
          status_id: 1,
        },
      });

    const enProceso =
      await prisma.tickets.count({
        where: {
          ...where,
          status_id: 3,
        },
      });

    const realizados =
      await prisma.tickets.count({
        where: {
          ...where,
          status_id: 6,
        },
      });

    const vencidos =
      await prisma.tickets.count({
        where: {
          ...where,
          status_id: 9,
        },
      });

    const tickets =
      await prisma.tickets.findMany({
        where,
        include: {
          categories: true,
          priorities: true,
          departments: true,
        },
      });

    const monthMap = {};
    const weekMap = {};
    const categoryMap = {};
    const priorityMap = {};
    const departmentMap = {};
   

    tickets.forEach((ticket) => {

      if (!ticket.created_at) {
        return;
      }

      const date =
        new Date(ticket.created_at);

      const month =
        date.toLocaleString(
          "es-MX",
          {
            month: "short",
          }
        );

      monthMap[month] =
        (monthMap[month] || 0) + 1;

      const firstDay =
        new Date(
          date.getFullYear(),
          0,
          1
        );

      const week =
        Math.ceil(
          (
            (
              date -
              firstDay
            ) /
            86400000 +
            firstDay.getDay() +
            1
          ) / 7
        );

      weekMap[
        `Semana ${week}`
      ] =
        (
          weekMap[
            `Semana ${week}`
          ] || 0
        ) + 1;

      const category =
        ticket.categories?.name ||
        "Sin Categoría";

      categoryMap[category] =
        (
          categoryMap[category] || 0
        ) + 1;

      const priority =
        ticket.priorities?.name ||
        "Sin Prioridad";

      priorityMap[priority] =
        (
          priorityMap[priority] || 0
        ) + 1;

      const department =
        ticket.departments?.name ||
        "Sin Departamento";

      departmentMap[department] =
        (
          departmentMap[
            department
          ] || 0
        ) + 1;

    });

    res.json({

      total,
      nuevos,
      enProceso,
      realizados,
      vencidos,

      monthly:
        Object.entries(monthMap)
          .map(
            ([name, total]) => ({
              name,
              total,
            })
          ),

      weekly:
        Object.entries(weekMap)
          .map(
            ([name, total]) => ({
              name,
              total,
            })
          ),

      categories:
        Object.entries(categoryMap)
          .map(
            ([name, total]) => ({
              name,
              total,
            })
          ),

      priorities:
        Object.entries(priorityMap)
          .map(
            ([name, total]) => ({
              name,
              total,
            })
          ),

      departments:
        Object.entries(departmentMap)
          .map(
            ([name, total]) => ({
              name,
              total,
            })
          ),

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

const exportExcel = async (req, res) => {
  try {
    const total = await prisma.tickets.count();

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

    const tickets =
      await prisma.tickets.findMany({
        include: {
          categories: true,
          priorities: true,
          statuses: true,
          departments: true,
          users_tickets_requester_idTousers:
            true,
        },
        orderBy: {
          created_at: "desc",
        },
      });

    const workbook =
      new ExcelJS.Workbook();

    workbook.creator =
      "MED HelpDesk";

    const summary =
      workbook.addWorksheet(
        "Resumen"
      );

    summary.mergeCells("A1:D2");

    const titleCell =
      summary.getCell("A1");

    titleCell.value =
      "MED HelpDesk - Reporte Ejecutivo";

    titleCell.font = {
      size: 18,
      bold: true,
      color: {
        argb: "FFFFFF",
      },
    };

    titleCell.alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "2C3E91",
      },
    };

    summary.getCell("A4").value =
      "Generado";

    summary.getCell("B4").value =
      new Date().toLocaleString(
        "es-MX"
      );

    summary.getCell("A6").value =
      "Total Tickets";

    summary.getCell("B6").value =
      total;

    summary.getCell("A7").value =
      "Nuevos";

    summary.getCell("B7").value =
      nuevos;

    summary.getCell("A8").value =
      "En Proceso";

    summary.getCell("B8").value =
      enProceso;

    summary.getCell("A9").value =
      "Realizados";

    summary.getCell("B9").value =
      realizados;

    summary.getCell("A10").value =
      "Vencidos";

    summary.getCell("B10").value =
      vencidos;

    const ticketsSheet =
      workbook.addWorksheet(
        "Tickets"
      );

    ticketsSheet.columns = [
      {
        header: "Ticket",
        key: "ticket",
        width: 20,
      },
      {
        header: "Fecha",
        key: "fecha",
        width: 20,
      },
      {
        header: "Solicitante",
        key: "solicitante",
        width: 35,
      },
      {
        header: "Departamento",
        key: "departamento",
        width: 30,
      },
      {
        header: "Tipo Soporte",
        key: "categoria",
        width: 30,
      },
      {
        header: "Prioridad",
        key: "prioridad",
        width: 20,
      },
      {
        header: "Estado",
        key: "estado",
        width: 20,
      },
      {
        header: "Descripción",
        key: "descripcion",
        width: 60,
      },
    ];

    const headerRow =
      ticketsSheet.getRow(1);

    headerRow.font = {
      bold: true,
      color: {
        argb: "FFFFFF",
      },
    };

    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: {
        argb: "0D47A1",
      },
    };

    tickets.forEach(
      (ticket) => {
        ticketsSheet.addRow({
          ticket:
            ticket.ticket_number,
          fecha:
            ticket.created_at,
          solicitante:
            ticket
              .users_tickets_requester_idTousers
              ?.name,
          departamento:
            ticket.departments
              ?.name,
          categoria:
            ticket.categories
              ?.name,
          prioridad:
            ticket.priorities
              ?.name,
          estado:
            ticket.statuses
              ?.name,
          descripcion:
            ticket.description,
        });
      }
    );

    ticketsSheet.eachRow(
      (row) => {
        row.eachCell(
          (cell) => {
            cell.border = {
              top: {
                style: "thin",
              },
              left: {
                style: "thin",
              },
              bottom: {
                style: "thin",
              },
              right: {
                style: "thin",
              },
            };
          }
        );
      }
    );

    ticketsSheet.views = [
      {
        state: "frozen",
        ySplit: 1,
      },
    ];

    ticketsSheet.autoFilter = {
      from: "A1",
      to: "H1",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=MED_HelpDesk_Report.xlsx"
    );

    await workbook.xlsx.write(
      res
    );

    res.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};


const path = require("path");

const exportPDF = async (req, res) => {
  try {

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

    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=MED_HelpDesk_Executive_Report.pdf"
    );

    doc.pipe(res);

    const medLogo =
      path.join(
        __dirname,
        "../../assets/med-logo.png"
      );

    const sewsLogo =
      path.join(
        __dirname,
        "../../assets/sews-logo.png"
      );

    try {

      doc.image(
        medLogo,
        40,
        30,
        {
          width: 90,
        }
      );

      doc.image(
        sewsLogo,
        460,
        30,
        {
          width: 90,
        }
      );

    } catch {}

    doc
      .fillColor("#2C3E91")
      .fontSize(28)
      .text(
        "MED HELPDESK",
        0,
        120,
        {
          align: "center",
        }
      );

    doc
      .fillColor("#000000")
      .fontSize(18)
      .text(
        "Reporte Ejecutivo de Tickets",
        {
          align: "center",
        }
      );

    doc.moveDown(2);

    doc
      .fontSize(11)
      .text(
        `Generado: ${new Date().toLocaleString(
          "es-MX"
        )}`,
        {
          align: "center",
        }
      );

    doc.addPage();

    doc
      .fillColor("#2C3E91")
      .fontSize(22)
      .text("Dashboard Ejecutivo");

    const cards = [
      {
        title: "TOTAL",
        value: total,
        color: "#0D47A1",
      },
      {
        title: "NUEVOS",
        value: nuevos,
        color: "#1976D2",
      },
      {
        title: "PROCESO",
        value: enProceso,
        color: "#1565C0",
      },
      {
        title: "REALIZADOS",
        value: realizados,
        color: "#283593",
      },
      {
        title: "VENCIDOS",
        value: vencidos,
        color: "#546E7A",
      },
    ];

    let x = 40;
    const y = 120;

    cards.forEach((card) => {

      doc
        .fillColor(card.color)
        .roundedRect(
          x,
          y,
          95,
          70,
          8
        )
        .fill();

      doc
        .fillColor("white")
        .fontSize(10)
        .text(
          card.title,
          x,
          y + 15,
          {
            width: 95,
            align: "center",
          }
        );

      doc
        .fontSize(22)
        .text(
          `${card.value}`,
          x,
          y + 35,
          {
            width: 95,
            align: "center",
          }
        );

      x += 105;

    });

    doc.y = 240;

    doc
      .fillColor("#2C3E91")
      .fontSize(18)
      .text(
        "Resumen Ejecutivo"
      );

    doc.moveDown();

    doc
      .fillColor("#000")
      .fontSize(12)
      .text(
        `El sistema registra ${total} tickets acumulados.`
      );

    doc.text(
      `${realizados} tickets han sido completados exitosamente.`
    );

    doc.text(
      `${vencidos} tickets permanecen vencidos.`
    );

    doc.addPage();

    doc
      .fillColor("#2C3E91")
      .fontSize(20)
      .text(
        "Resumen por Departamento"
      );

    doc.moveDown();

    const depts =
      await prisma.tickets.groupBy({
        by: ["department_id"],
        _count: {
          id: true,
        },
      });

    depts.forEach((d) => {

      doc
        .fillColor("#000")
        .fontSize(12)
        .text(
          `Departamento ${d.department_id}: ${d._count.id}`
        );

    });

    doc.addPage();

    doc
      .fillColor("#2C3E91")
      .fontSize(20)
      .text(
        "Resumen por Prioridad"
      );

    doc.moveDown();

    const priorities =
      await prisma.tickets.groupBy({
        by: ["priority_id"],
        _count: {
          id: true,
        },
      });

    priorities.forEach((p) => {

      doc
        .fillColor("#000")
        .fontSize(12)
        .text(
          `Prioridad ${p.priority_id}: ${p._count.id}`
        );

    });

    doc.end();

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: error.message,
    });

  }
};

module.exports = {
  getReports,
  exportExcel,
  exportPDF,
};