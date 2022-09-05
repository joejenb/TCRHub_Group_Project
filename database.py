from flask import Flask, make_response, jsonify, request
import json

clientdb = {"389257": {"name": 'Doug Wright', "email": "doug@net.com", "address": "43 Lapwing Avenue"}, "6578987" : {"name": "Matt Ost", "email": "matt@gmail.com", "address": "19 Dunelm Court"}, "3892498" : {"name": "Charlotte Kavanaugh", "email": "charlotte@hotmail.com", "address": "12 Cherry Blossom Square"}}

personneldb = {"7fdd1db5-d619-4a9b-a3d1-b9f25bef5b57":{"name": "Demo Account", "email": "demo@tcrhubdurham.onmicrosoft.com", "address": "2 Colpitts Terrace", "mobile": "00000000000"}, "38989257" : {"name": 'Sharon East', "email": "sharon@net.com", "address": "40 Elm Garth"}, "243": {"name": "Christian Klein", "email": "christian@gmail.com", "address": "25 North Court"}, "2498" : {"name": "Shelly Dew", "email": "shelly0@hotmail.com", "address": "71 St Mary's Place"}}

bookingdb = {}

resourcedb = {
"1":{"name":"Recording Studio", "description":"A place to record music", "unit":"Music Studios"},
"2":{"name":"Afternoon Tea", "description":"TCR Hub Cafe", "unit":"Cafe"},
"3":{"name":"Business Venue", "description":"Room Hire", "unit":"Room Hire"},
"4":{"name":"Kayaking & Canoeing", "description":"Rent a Kayak or Canoe", "unit":"Outdoor Activites"},
"5":{"name":"Accomodation", "description":"Stay overnight at TCR Hub", "unit":"Accomodation"},
"6":{"name":"Minibus", "description":"Hire a minibus", "unit":"Community Transport"},
}

unitdb = {
"1":{"name":"Music Studios"},
"2":{"name":"Cafe"},
"3":{"name":"Room Hire"},
"4":{"name":"Outdoor Activities"},
"5":{"name":"Accomodation"},
"6":{"name":"Community Transport"}
}

def load(folder):
    global clientdb
    global personneldb
    global bookingdb
    global resourcedb
    global unitdb

    with open(folder + "/clientdb.json") as db:
        clientdb = json.loads(db.read())

    with open(folder + "/personneldb.json") as db:
        personneldb = json.loads(db.read())

    with open(folder + "/bookingdb.json") as db:
        bookingdb = json.loads(db.read())

    with open(folder + "/resourcedb.json") as db:
        resourcedb = json.loads(db.read())

    with open(folder + "/unitdb.json") as db:
        unitdb = json.loads(db.read())

def dump(folder):
    with open(folder + "/clientdb.json", "w") as db:
       print(json.dumps(clientdb), file=db)

    with open(folder + "/personneldb.json", "w") as db:
       print(json.dumps(personneldb), file=db)

    with open(folder + "/bookingdb.json", "w") as db:
       print(json.dumps(bookingdb), file=db)

    with open(folder + "/resourcedb.json", "w") as db:
       print(json.dumps(resourcedb), file=db)

    with open(folder + "/unitdb.json", "w") as db:
       print(json.dumps(unitdb), file=db)

load("sysdata")

app = Flask(__name__)

for cid in clientdb:
    clientdb[cid]["id"] = cid

for pid in personneldb:
    personneldb[pid]["id"] = pid

for bid in bookingdb:
    bookingdb[bid]["id"] = bid

for rid in resourcedb:
    resourcedb[rid]["id"] = rid

for uid in unitdb:
    unitdb[uid]["id"] = uid

@app.route('/api/client-bookings/<string:c_name>')
def client_bookings(c_name):
    bookings = [booking for booking in bookingdb.values() if booking["bookedby"] == c_name]
    return jsonify(bookings)

@app.route('/api/client-list')
def client_list():
    query = request.args.get("q")
    number = int(request.args.get("n") or len(clientdb))
    if not query:
        return jsonify(list(clientdb.values())[:number])
    else:
        return jsonify([cl for cl in list(clientdb.values()) if query.lower() in cl["name"].lower()][:number])

@app.route('/api/client/<string:cid>', methods=["GET", "PUT", "DELETE"])
def client(cid):
    if request.method == 'GET':
        c = clientdb.get(cid)
        ce = [client for client in clientdb.values() if client["email"] == cid]
        if not c and ce:
            c = ce[0]
        return jsonify(c)
    elif request.method == 'PUT':
        if cid in clientdb:
            clientdb[cid].update(request.get_json())
            dump("sysdata")
            return make_response("", 200)
        return make_response("", 404)
    elif request.method == 'DELETE':
        del clientdb[cid]
        dump("sysdata")
        return make_response("", 200)

@app.route('/api/client/', methods=["GET", "POST"])
def client_post():
    if request.method == "POST":
        cid = 1 if not len(clientdb) else max((int(k) for k in clientdb.keys())) + 1
        email_table = [user["email"] for user in clientdb.values()]
        new_user = request.get_json()
        if new_user["email"] not in email_table:
            default = {"name": "", "email": "", "address": "", "id": str(cid), "hash": "", "salt": ""}
            default.update(new_user)
            clientdb[str(cid)] = default
            dump("sysdata")
            return jsonify(default)
        dump("sysdata")
        return make_response("", 200)
    elif request.method == "GET":
        email = request.args.get("email")
        for c in clientdb.values():
            if c["email"] == email:
                dump("sysdata")
                return jsonify(c)

@app.route('/api/client/<string:cid>/basic')
def client_basic(cid):
    cl = clientdb.get(cid)
    c = {"name": cl["name"], "id": cl["id"], "email": cl["email"]}
    return jsonify(c)

@app.route("/api/personnel-list")
def personnel_list():
    query = request.args.get("q")
    number = int(request.args.get("n") or len(personneldb))
    if not query:
        return jsonify(list(personneldb.values())[:number])
    else:
        return jsonify([per for per in list(personneldb.values()) if query.lower() in per["name"].lower()][:number])

@app.route('/api/personnel/<string:pid>', methods=["GET", "PUT"])
def personnel(pid):
    if request.method == 'GET':
        p = personneldb.get(pid)
        return jsonify(p)
    elif request.method == 'PUT':
        if pid in personneldb:
            personneldb[pid].update(request.get_json())
            dump("sysdata")
            return make_response("", 200)
        return make_response("", 404)

@app.route('/api/personnel/', methods=["POST"])
def personnel_post():
    default = {"name": "", "email": "", "address": "", "id": ""}
    default.update(request.get_json())
    personneldb[default["id"]] = default
    dump("sysdata")
    return jsonify(default)


@app.route('/api/personnel/<string:pid>/basic')
def personnel_basic(pid):
    per = personneldb.get(pid)
    p = {"name": per["name"], "id": cl["id"], "email": cl["email"]}
    return jsonify(p)


@app.route('/api/booking-list')
def booking_list():
    query = request.args.get("q")
    number = int(request.args.get("n") or len(bookingdb))
    if not query:
        return jsonify(list(bookingdb.values())[:number])
    else:
        return jsonify([cl for cl in list(bookingdb.values()) if query.lower() in cl["resource"].lower()][:number])

@app.route('/api/booking/<string:bid>', methods=["GET", "PUT", "DELETE"])
def booking(bid):
    if request.method == 'GET':
        c = bookingdb.get(bid)
        return jsonify(c)
    elif request.method == 'PUT':
        if bid in bookingdb:
            bookingdb[bid].update(request.get_json())
            dump("sysdata")
            return make_response("", 200)
        return make_response("", 404)
    elif request.method == 'DELETE':
        del bookingdb[bid]
        dump("sysdata")
        return make_response("", 200)

@app.route('/api/booking/', methods=["POST"])
def booking_post():
    bid = 1 if not bookingdb else max((int(k) for k in bookingdb.keys())) + 1
    default = {"resource": "", "date":"", "time":"", "unit":"", "documents":"", "clientid":"", "bookedby":"", "notes":"", "id": str(bid)}
    default.update(request.get_json())
    bookingdb[str(bid)] = default
    dump("sysdata")
    return jsonify(default)

@app.route('/api/resource/<string:rid>', methods=["GET", "PUT", "DELETE"])
def resource(rid):
    if request.method == 'GET':
        c = resourcedb.get(rid)
        return jsonify(c)
    elif request.method == 'PUT':
        if rid in resourcedb:
            resourcedb[rid].update(request.get_json())
            dump("sysdata")
            return make_response("", 200)
        return make_response("", 404)
    elif request.method == 'DELETE':
        del resourcedb[rid]
        dump("sysdata")
        return make_response("", 200)

@app.route('/api/resource/', methods=["POST"])
def resource_post():

    rid = 1 if not len(resourcedb) else max((int(k) for k in resourcedb.keys())) + 1
    default = {"id": str(rid), "name":"", "description":"", "unit":"", "confirmed":"false"}
    default.update(request.get_json())
    resourcedb[str(rid)] = default
    dump("sysdata")
    return jsonify(default)

@app.route('/api/resource-list')
def resource_list():
    number = len(resourcedb)
    return jsonify([rs for rs in list(resourcedb.values())][:number])

@app.route('/api/unit-list')
def unit_list():
    number = len(unitdb)
    return jsonify([u for u in list(unitdb.values())][:number])

