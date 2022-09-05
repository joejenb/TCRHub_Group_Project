#!/bin/sh

export FLASK_APP=database.py
flask run &
FLASK_PID=$!

cd userside
npm start &
US_PID=$!
cd ..

cd clientside
PORT=8080 npm start &
CS_PID=$!

trap "kill -15 $FLASK_PID $US_PID $CS_PID; echo $FLASK_PID" INT
wait $FLASK_PID $US_PID $CS_PID
