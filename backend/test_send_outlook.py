import win32com.client

DESTINATARIO = "tu_correo@sewsus.com.mx"

try:
    print("Conectando con Outlook...")

    try:
        outlook = win32com.client.GetActiveObject(
            "Outlook.Application"
        )
        print("Usando Outlook ya abierto")

    except Exception:
        outlook = win32com.client.Dispatch(
            "Outlook.Application"
        )
        print("Se inició una nueva instancia de Outlook")

    print("Creando correo...")

    mail = outlook.CreateItem(0)

    mail.To = DESTINATARIO
    mail.Subject = "Prueba MED HelpDesk"
    mail.HTMLBody = """
    <html>
      <body>
        <h2>MED HelpDesk</h2>
        <p>Este es un correo de prueba enviado mediante Outlook COM.</p>
      </body>
    </html>
    """

    print("Enviando correo...")

    mail.Send()

    print("Correo enviado correctamente")

except Exception as error:
    print("Error enviando correo:")
    print(repr(error))