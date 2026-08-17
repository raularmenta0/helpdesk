import win32com.client

print("Intentando conectar con Outlook...")

try:
    outlook = win32com.client.Dispatch("Outlook.Application")

    print("Outlook conectado correctamente")
    print("Cuentas detectadas:")

    for account in outlook.Session.Accounts:
        print(account.SmtpAddress)

except Exception as error:
    print("Error conectando con Outlook:")
    print(repr(error))