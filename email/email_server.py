# This program will run forever in the background and await HTTP requests from the middleware server
import send_email

API_PORT = 6000

from flask import Flask, make_response, jsonify, request

app = Flask(__name__)

@app.route('/send_email/', methods=["POST"])
def email_post():
    print(request.form.get('toaddr'), request.form.get('subject'), request.form.get('body'))
    send_email.send(request.form.get('toaddr'), request.form.get('subject'), request.form.get('body'))
    return jsonify(dict())

