const path = require("path");
const { spawn } = require("child_process");

const PYTHON_COMMAND =
  process.env.PYTHON_COMMAND ||
  "C:\\Users\\raul.armenta\\AppData\\Local\\Programs\\Python\\Python310\\python.exe";

// El archivo está directamente dentro de backend/
const PYTHON_SCRIPT = path.resolve(
  __dirname,
  "../../send_helpdesk_email.py"
);

console.log("Python:", PYTHON_COMMAND);
console.log("Script Python:", PYTHON_SCRIPT);

const sendMail = ({
  to,
  cc = "",
  subject,
  ticketNumber,
  category,
  priority,
  description,
}) => {
  return new Promise((resolve, reject) => {
    if (!to) {
      return reject(
        new Error("El destinatario está vacío")
      );
    }

    const pythonProcess = spawn(
      PYTHON_COMMAND,
      [PYTHON_SCRIPT],
      {
        windowsHide: false,
      }
    );

    let stdout = "";
    let stderr = "";
    let finished = false;

    const timeout = setTimeout(() => {
      if (finished) {
        return;
      }

      finished = true;

      pythonProcess.kill();

      reject(
        new Error(
          "El proceso de Outlook tardó más de 30 segundos"
        )
      );
    }, 30000);

    pythonProcess.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    pythonProcess.on("error", (error) => {
      if (finished) {
        return;
      }

      finished = true;
      clearTimeout(timeout);

      reject(
        new Error(
          `No se pudo ejecutar Python: ${error.message}`
        )
      );
    });

    pythonProcess.on("close", (code) => {
      if (finished) {
        return;
      }

      finished = true;
      clearTimeout(timeout);

      const output = stdout.trim();

      console.log("Salida de Python:", output);

      if (stderr.trim()) {
        console.error(
          "Error de Python:",
          stderr.trim()
        );
      }

      let result = null;

      try {
        result = output
          ? JSON.parse(output)
          : null;
      } catch (error) {
        return reject(
          new Error(
            `Python no devolvió JSON válido. Salida: ${output}`
          )
        );
      }

      if (
        code !== 0 ||
        !result ||
        result.success !== true
      ) {
        return reject(
          new Error(
            result?.error ||
              stderr ||
              "Outlook no pudo enviar el correo"
          )
        );
      }

      return resolve(result);
    });

    const payload = {
      to,
      cc,
      subject,
      ticketNumber,
      category,
      priority,
      description,
    };

    pythonProcess.stdin.write(
      JSON.stringify(payload)
    );

    pythonProcess.stdin.end();
  });
};

const sendTicketCreatedEmail = async ({
  email,
  ticketNumber,
  category,
  priority,
  description,
}) => {
  return sendMail({
    to: email,

    cc: [
      "mauricio.montes@sewsus.com.mx",
      "julio.rodriguez@sewsus.com.mx",
      "raul.armenta@sewsus.com.mx"
    ].join(";"),

    subject: `Ticket ${ticketNumber} creado`,
    ticketNumber,
    category,
    priority,
    description,
  });
};

const sendTicketStatusUpdatedEmail = async ({
  email,
  ticketNumber,
  status,
}) => {
  return sendMail({
    to: email,

    cc: [
      "mauricio.montes@sewsus.com.mx",
      "julio.rodriguez@sewsus.com.mx",
      "raul.armenta@sewsus.com.mx"
    ].join(";"),

    subject: `Actualización Ticket ${ticketNumber}`,
    ticketNumber,
    description: `El estado del ticket cambió a: ${status}`,
  });
};

module.exports = {
  sendMail,
  sendTicketCreatedEmail,
  sendTicketStatusUpdatedEmail,
};