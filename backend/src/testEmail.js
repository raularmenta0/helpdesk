// src/testEmail.js

require("dotenv").config({
  path: require("path").resolve(__dirname, "../.env"),
});

const {
  sendMail,
} = require("./services/emailService");

(async () => {
  try {
    const result = await sendMail({
      to: process.env.EMAIL_USER,
      subject: "Prueba MED HelpDesk",
      html: `
        <h2>MED HelpDesk</h2>
        <p>Este es un correo de prueba.</p>
      `,
    });

    console.log("Prueba exitosa:", result.messageId);
  } catch (error) {
    console.error("Falló la prueba de correo:", {
      message: error.message,
      code: error.code,
      response: error.response,
      responseCode: error.responseCode,
    });
  }
})();