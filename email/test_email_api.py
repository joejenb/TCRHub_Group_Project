import requests

import send_email

if __name__ == "__main__":
    url = 'http://localhost:6000/send_email/'
    email_obj = {
    'toaddr': 'Jamie.S.Stirling@durham.ac.uk',
    "subject": "Test from python.",
    'body':"Email sent directly through python code."
    }

    # first test email can be sent directly

    send_email.send(email_obj['toaddr'], email_obj['subject'], email_obj['body'])

    # now test if email can be sent via API call

    email_obj["subject"] = "Test from API."
    email_obj["body"] = "Email sent via API call."

    try:
        requests.post(url, data = email_obj)
        print("Sent successfully.")
    except Exception as e:
        print("Server or connection error.")

