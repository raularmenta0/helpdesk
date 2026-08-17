
import sys
import json
import html
import win32com.client


def conectar_outlook():
    try:
        outlook = win32com.client.GetActiveObject(
            "Outlook.Application"
        )

        print(
            "Outlook activo detectado",
            file=sys.stderr
        )

        return outlook

    except Exception:
        pass

    try:
        outlook = win32com.client.Dispatch(
            "Outlook.Application"
        )

        print(
            "Nueva instancia de Outlook creada",
            file=sys.stderr
        )

        return outlook

    except Exception as error:
        raise Exception(
            "No se pudo iniciar Outlook mediante COM: "
            f"{repr(error)}"
        )


def enviar_correo(datos):
    destinatario = datos.get("to")
    cc = datos.get("cc", "")
    asunto = datos.get("subject")
    ticket_number = datos.get("ticketNumber")
    category = datos.get("category")
    priority = datos.get("priority")
    description = datos.get("description")

    if not destinatario:
        raise Exception(
            "El destinatario está vacío"
        )

    if not asunto:
        raise Exception(
            "El asunto está vacío"
        )

    outlook = conectar_outlook()
    mail = outlook.CreateItem(0)

    mail.To = destinatario

    if cc:
        mail.CC = cc

    mail.Subject = asunto

    safe_ticket = html.escape(
        str(ticket_number or "")
    )

    safe_category = html.escape(
        str(category or "No especificado")
    )

    safe_priority = html.escape(
        str(priority or "No especificada")
    )

    safe_description = html.escape(
        str(description or "Sin descripción")
    )

    mail.HTMLBody = f"""
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ticket registrado</title>
</head>

<body style="
    margin: 0;
    padding: 0;
    background-color: #f3f5f9;
    font-family: Arial, Helvetica, sans-serif;
    color: #263238;
">

    <table
        width="100%"
        cellpadding="0"
        cellspacing="0"
        border="0"
        style="background-color: #f3f5f9; padding: 30px 10px;"
    >
        <tr>
            <td align="center">

                <table
                    width="620"
                    cellpadding="0"
                    cellspacing="0"
                    border="0"
                    style="
                        max-width: 620px;
                        width: 100%;
                        background-color: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 3px 12px rgba(0,0,0,0.10);
                    "
                >

                    <!-- Encabezado -->
                    <tr>
                        <td style="
                            background-color: #283b91;
                            padding: 28px 35px;
                            color: #ffffff;
                        ">
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                            >
                                <tr>
                                    <td>
                                        <div style="
                                            font-size: 25px;
                                            font-weight: bold;
                                            letter-spacing: 0.5px;
                                        ">
                                            MED HelpDesk
                                        </div>

                                        <div style="
                                            margin-top: 6px;
                                            font-size: 13px;
                                            color: #dce3ff;
                                        ">
                                            Manufacturing Engineering Dept.
                                        </div>
                                    </td>

                                    <td align="right">
                                        <div style="
                                            display: inline-block;
                                            padding: 8px 12px;
                                            border: 1px solid #ffffff;
                                            border-radius: 20px;
                                            font-size: 12px;
                                            color: #ffffff;
                                        ">
                                            TICKET
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Contenido principal -->
                    <tr>
                        <td style="padding: 35px;">

                            <div style="
                                display: inline-block;
                                padding: 8px 14px;
                                background-color: #e8f5e9;
                                color: #2e7d32;
                                border-radius: 20px;
                                font-size: 13px;
                                font-weight: bold;
                            ">
                                ✓ Solicitud registrada
                            </div>

                            <h1 style="
                                margin: 20px 0 10px 0;
                                color: #283b91;
                                font-size: 25px;
                            ">
                                Su ticket fue creado correctamente
                            </h1>

                            <p style="
                                margin: 0 0 25px 0;
                                color: #5f6b7a;
                                font-size: 15px;
                                line-height: 1.6;
                            ">
                                Hemos recibido su solicitud de soporte.
                                Nuestro equipo revisará la información y dará
                                seguimiento conforme a los procedimientos establecidos.
                            </p>

                            <!-- Número del ticket -->
                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    background-color: #f0f3ff;
                                    border-left: 5px solid #283b91;
                                    border-radius: 6px;
                                    margin-bottom: 25px;
                                "
                            >
                                <tr>
                                    <td style="padding: 18px 20px;">
                                        <div style="
                                            color: #687386;
                                            font-size: 12px;
                                            text-transform: uppercase;
                                            letter-spacing: 0.7px;
                                        ">
                                            Número de ticket
                                        </div>

                                        <div style="
                                            margin-top: 6px;
                                            color: #283b91;
                                            font-size: 24px;
                                            font-weight: bold;
                                        ">
                                            {safe_ticket}
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Detalles -->
                            <h2 style="
                                margin: 0 0 14px 0;
                                color: #263238;
                                font-size: 18px;
                            ">
                                Detalles de la solicitud
                            </h2>

                            <table
                                width="100%"
                                cellpadding="0"
                                cellspacing="0"
                                border="0"
                                style="
                                    border: 1px solid #e0e4ea;
                                    border-radius: 8px;
                                "
                            >
                                <tr>
                                    <td style="
                                        width: 38%;
                                        padding: 14px 16px;
                                        background-color: #f8f9fb;
                                        border-bottom: 1px solid #e0e4ea;
                                        color: #687386;
                                        font-size: 13px;
                                        font-weight: bold;
                                    ">
                                        Tipo de soporte
                                    </td>

                                    <td style="
                                        padding: 14px 16px;
                                        border-bottom: 1px solid #e0e4ea;
                                        color: #263238;
                                        font-size: 14px;
                                    ">
                                        {safe_category}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding: 14px 16px;
                                        background-color: #f8f9fb;
                                        border-bottom: 1px solid #e0e4ea;
                                        color: #687386;
                                        font-size: 13px;
                                        font-weight: bold;
                                    ">
                                        Prioridad
                                    </td>

                                    <td style="
                                        padding: 14px 16px;
                                        border-bottom: 1px solid #e0e4ea;
                                        color: #263238;
                                        font-size: 14px;
                                    ">
                                        {safe_priority}
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding: 14px 16px;
                                        background-color: #f8f9fb;
                                        color: #687386;
                                        font-size: 13px;
                                        font-weight: bold;
                                        vertical-align: top;
                                    ">
                                        Descripción
                                    </td>

                                    <td style="
                                        padding: 14px 16px;
                                        color: #263238;
                                        font-size: 14px;
                                        line-height: 1.5;
                                    ">
                                        {safe_description}
                                    </td>
                                </tr>
                            </table>

                            <p style="
                                margin: 28px 0 0 0;
                                color: #5f6b7a;
                                font-size: 14px;
                                line-height: 1.6;
                            ">
                                Conserve este número para consultar el estado
                                de su solicitud con el área de soporte.
                            </p>

                        </td>
                    </tr>

                    <!-- Pie de correo -->
                    <tr>
                        <td style="
                            background-color: #f8f9fb;
                            border-top: 1px solid #e5e8ed;
                            padding: 22px 35px;
                            text-align: center;
                        ">
                            <p style="
                                margin: 0;
                                color: #687386;
                                font-size: 12px;
                                line-height: 1.6;
                            ">
                                Este correo fue generado automáticamente por MED HelpDesk.
                                <br>
                                Por favor, no responda directamente a este mensaje.
                            </p>

                            <p style="
                                margin: 10px 0 0 0;
                                color: #9aa3af;
                                font-size: 11px;
                            ">
                                © MED HelpDesk
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
"""

    print(
        "Intentando enviar correo mediante Outlook...",
        file=sys.stderr
    )

    mail.Send()

    return {
        "success": True,
        "message": "Correo enviado mediante Outlook",
        "to": destinatario,
    }

def crear_html_estado_actualizado(
    ticket_number,
    status
):
    safe_ticket = html.escape(
        str(ticket_number or "")
    )

    safe_status = html.escape(
        str(status or "No especificado")
    )

    return f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>

    <body style="
        margin: 0;
        padding: 30px 10px;
        background-color: #f3f5f9;
        font-family: Arial, Helvetica, sans-serif;
        color: #263238;
    ">

        <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
        >
            <tr>
                <td align="center">

                    <table
                        width="620"
                        cellpadding="0"
                        cellspacing="0"
                        border="0"
                        style="
                            max-width: 620px;
                            width: 100%;
                            background-color: #ffffff;
                            border-radius: 12px;
                            overflow: hidden;
                            box-shadow: 0 3px 12px rgba(0,0,0,0.10);
                        "
                    >
                        <tr>
                            <td style="
                                background-color: #283b91;
                                padding: 28px 35px;
                                color: #ffffff;
                            ">
                                <div style="
                                    font-size: 25px;
                                    font-weight: bold;
                                ">
                                    MED HelpDesk
                                </div>

                                <div style="
                                    margin-top: 6px;
                                    color: #dce3ff;
                                    font-size: 13px;
                                ">
                                    Manufacturing Engineering Dept.
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td style="padding: 35px;">

                                <div style="
                                    display: inline-block;
                                    padding: 8px 14px;
                                    background-color: #fff4e5;
                                    color: #a15c00;
                                    border-radius: 20px;
                                    font-size: 13px;
                                    font-weight: bold;
                                ">
                                    Actualizacion de ticket
                                </div>

                                <h1 style="
                                    color: #283b91;
                                    font-size: 24px;
                                    margin: 20px 0 12px 0;
                                ">
                                    El estado de su ticket cambio
                                </h1>

                                <p style="
                                    color: #5f6b7a;
                                    font-size: 15px;
                                    line-height: 1.6;
                                ">
                                    Su solicitud de soporte tiene una nueva actualizacion.
                                </p>

                                <table
                                    width="100%"
                                    cellpadding="0"
                                    cellspacing="0"
                                    border="0"
                                    style="
                                        margin-top: 25px;
                                        border: 1px solid #e0e4ea;
                                        border-radius: 8px;
                                    "
                                >
                                    <tr>
                                        <td style="
                                            padding: 16px;
                                            background-color: #f8f9fb;
                                            color: #687386;
                                            font-weight: bold;
                                        ">
                                            Ticket
                                        </td>

                                        <td style="
                                            padding: 16px;
                                            color: #283b91;
                                            font-weight: bold;
                                        ">
                                            {safe_ticket}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td style="
                                            padding: 16px;
                                            background-color: #f8f9fb;
                                            color: #687386;
                                            font-weight: bold;
                                        ">
                                            Nuevo estado
                                        </td>

                                        <td style="
                                            padding: 16px;
                                            color: #2e7d32;
                                            font-weight: bold;
                                        ">
                                            {safe_status}
                                        </td>
                                    </tr>
                                </table>

                                <p style="
                                    margin-top: 28px;
                                    color: #5f6b7a;
                                    font-size: 14px;
                                    line-height: 1.6;
                                ">
                                    Puede ingresar al sistema MED HelpDesk
                                    para consultar más información.
                                </p>

                            </td>
                        </tr>

                        <tr>
                            <td style="
                                background-color: #f8f9fb;
                                border-top: 1px solid #e5e8ed;
                                padding: 22px 35px;
                                text-align: center;
                            ">
                                <p style="
                                    margin: 0;
                                    color: #687386;
                                    font-size: 12px;
                                    line-height: 1.6;
                                ">
                                    Este correo fue generado automáticamente por MED HelpDesk.
                                    <br>
                                    Por favor, no responda directamente a este mensaje.
                                </p>
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    """


def main():
    try:
        input_data = sys.stdin.read()

        if not input_data:
            raise Exception(
                "No se recibieron datos desde Node.js"
            )

        datos = json.loads(input_data)

        resultado = enviar_correo(datos)

        print(
            json.dumps(
                resultado,
                ensure_ascii=False
            )
        )

    except Exception as error:
        print(
            json.dumps(
                {
                    "success": False,
                    "error": repr(error),
                },
                ensure_ascii=False
            )
        )

        sys.exit(1)


if __name__ == "__main__":
    main()