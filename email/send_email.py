import smtplib, ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send(toaddr, subject, body):
    port = 465  # For SSL
    fromaddr = "noreply@tcrhub.co.uk"

    msg = MIMEMultipart()
    msg['From'] = fromaddr
    msg['To'] = toaddr
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    server = smtplib.SMTP('smtp.gmail.com', 587)
    server.ehlo()
    server.starttls()
    server.ehlo()
    server.login("noreply.tcrhub@gmail.com", "SuperSecure123")
    text = msg.as_string()
    server.sendmail(fromaddr, toaddr, text)