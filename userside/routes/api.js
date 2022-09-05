require('dotenv').config();

const request = require('request');
var express = require('express');
var router = express.Router();
var graph = require('../graph');

app = express();

// * API Endpoints for calls from website * //

// Get the data associated with an entity
router.get('/api/entity/:type/:id', function (req, res, next) {
    let id = req.params.id;
    if (req.params.type == "client") {
        request('http://127.0.0.1:5000/api/client/' + id, function (error, response, body) {
            res.json({"status": 200, "properties": JSON.parse(body)});
        });
    } else if (req.params.type == "personnel") {
        request('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
            res.json({"status": 200, "properties": JSON.parse(body)});
        });
    } else if (req.params.type == "booking") {
        request('http://127.0.0.1:5000/api/booking/' + id, function (error, response, body) {
            res.json({"status": 200, "properties": JSON.parse(body)});
        });
    } else if (req.params.type == "resource") {
        request('http://127.0.0.1:5000/api/resource/' + id, function (error, response, body) {
            res.json({"status": 200, "properties": JSON.parse(body)});
        });
    }
});


// Update the data associated with an entity
router.put('/api/entity/:type/:id', function (req, res, next) {
    if (req.params.type == "client") {
        let id = req.params.id;
        request.put({url: 'http://127.0.0.1:5000/api/client/' + id, json: req.body}, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "personnel") {
        let id = req.params.id;
        request.put({
            url: 'http://127.0.0.1:5000/api/personnel/' + id,
            json: req.body
        }, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "booking") {
        let id = req.params.id;
        request.put({url: 'http://127.0.0.1:5000/api/booking/' + id, json: req.body}, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "resource") {
        let id = req.params.id;
        request.put({
            url: 'http://127.0.0.1:5000/api/resource/' + id,
            json: req.body
        }, function (error, response, body) {
            res.json({"status": 200});
        });
    }
});

// Create a new entity and return its id
router.post('/api/entity/:type/', async function (req, res, next) {
    if (req.params.type == "client") {
        request.post({url: 'http://127.0.0.1:5000/api/client/', json: req.body}, function (error, response, body) {
            res.json({"status": 200, "id": body["id"]});
        });
    } else if (req.params.type == "personnel") {
		let details = req.body;
		if (req.user){
			let auth_token = req.user.oauthToken.token.access_token;
			let new_user = await graph.addNewUser(auth_token, details["name"], details["name"].replace(/\s+/g, ''), details["email"], details["password"]);
			if (new_user){
				details["id"] = new_user.id;
				request.post({url: 'http://127.0.0.1:5000/api/personnel/', json: details}, function (error, response, body) {
					res.json({"status": 200, "id": body["id"]});
				});
			} else {
				res.json({"status": 400, "id": null, "error": "Error creating user please check form information"});
			}
		} else{
			res.json({"status": 400, "id": "F", "error": "User must be logged in to create other personnel"});
		}	
    } else if (req.params.type == "booking") {
        request.post({url: 'http://127.0.0.1:5000/api/booking/', json: req.body}, function (error, response, body) {
            res.json({"status": 200, "id": body["id"]});
        });
    } else if (req.params.type == "resource") {
        request.post({url: 'http://127.0.0.1:5000/api/resource/', json: req.body}, function (error, response, body) {
            res.json({"status": 200, "id": body["id"]});
        });
    } else if (req.params.type == "account") {
    }
});

// Delete an entity
router.delete('/api/entity/:type/:id', function (req, res, next) {
    if (req.params.type == "client") {
        let id = req.params.id;
        request.delete('http://127.0.0.1:5000/api/client/' + id, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "personnel") {
        let id = req.params.id;
        request.delete('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "booking") {
        let id = req.params.id;
        request.delete('http://127.0.0.1:5000/api/booking/' + id, function (error, response, body) {
            res.json({"status": 200});
        });
    } else if (req.params.type == "resource") {
        let id = req.params.id;
        request.delete('http://127.0.0.1:5000/api/resource/' + id, function (error, response, body) {
            res.json({"status": 200});
        });
    }
});

// Fetch a rendered HTML block
router.get('/api/block/:name', function (req, res, next) {
    if (req.params.name == "clientList") {
        request('http://127.0.0.1:5000/api/client-list?n=50', function (error, response, body) {
            req.app.render('client-list', {clients: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            })
        });
    } else if (req.params.name == "clientInfo") {
        let id = req.query.client;
        if (id === undefined) {
            res.json({"status": 200, "blob": '<div id="client-pane"></div>'});
        } else {
            request('http://127.0.0.1:5000/api/client/' + id, function (error, response, body) {
                req.app.render("client-info", {client: JSON.parse(body)}, function (err, html) {
                    res.json({"status": 200, "blob": html});
                });
            });
        }
    } else if (req.params.name == "clientEdit") {
        let id = req.query.client;
        request('http://127.0.0.1:5000/api/client/' + id, function (error, response, body) {
            req.app.render("client-edit", {client: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html});
            });
        });
    } else if (req.params.name == "clientCreate") {
        req.app.render("client-create", {}, function (err, html) {
            res.json({"status": 200, "blob": html});
        });
    } else if (req.params.name == "personnelList") {
        request('http://127.0.0.1:5000/api/personnel-list?n=50', function (error, response, body) {
            req.app.render('personnel-list', {personnel: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            })
        });
    } else if (req.params.name == "personnelInfo") {
        let id = req.query.personnel;
        if (id === undefined) {
            res.json({"status": 200, "blob": '<div id="personnel-pane"></div>'});
        } else {
            request('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
                req.app.render("personnel-info", {personnel: JSON.parse(body)}, function (err, html) {
                    res.json({"status": 200, "blob": html});
                });
            });
        }
    } else if (req.params.name == "personnelEdit") {
        let id = req.query.personnel;
        request('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
            req.app.render("personnel-edit", {personnel: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html});
            });
        });
    } else if (req.params.name == "personnelCreate") {
        req.app.render("personnel-create", {}, function (err, html) {
            res.json({"status": 200, "blob": html});
        });
    } else if (req.params.name == "bookingList") {
        request('http://127.0.0.1:5000/api/booking-list?n=50', function (error, response, body) {
            req.app.render('booking-list', {bookings: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            })
        });
    } else if (req.params.name == "bookingInfo") {
        let id = req.query.booking;
        if (id === undefined) {
            res.json({"status": 200, "blob": '<div id="booking-pane"></div>'});
        } else {
            request('http://127.0.0.1:5000/api/booking/' + id, function (error, response, body) {
                req.app.render("booking-info", {booking: JSON.parse(body)}, function (err, html) {
                    res.json({"status": 200, "blob": html});
                });
            });
        }
    } else if (req.params.name == "bookingEdit") {
        let id = req.query.booking;
        request('http://127.0.0.1:5000/api/booking/' + id, function (error, response, body) {
            request('http://127.0.0.1:5000/api/resource-list', function (error, response, body2) {
                req.app.render("booking-edit", {
                    booking: JSON.parse(body),
                    resources: JSON.parse(body2)
                }, function (err, html2) {
                    res.json({"status": 200, "blob": html2});
                });
            });
        });
    } else if (req.params.name == "bookingCreate") {
        request('http://127.0.0.1:5000/api/resource-list', function (error, response, body) {
            req.app.render('booking-create', {resources: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            });
        });
    } else if (req.params.name == "resourceList") {
        request('http://127.0.0.1:5000/api/resource-list?n=50', function (error, response, body) {
            req.app.render('resource-list', {resources: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            })
        });
    } else if (req.params.name == "resourceInfo") {
        let id = req.query.resource;
        if (id === undefined) {
            res.json({"status": 200, "blob": '<div id="resource-pane"></div>'});
        } else {
            request('http://127.0.0.1:5000/api/resource/' + id, function (error, response, body) {
                req.app.render("resource-info", {resource: JSON.parse(body)}, function (err, html) {
                    res.json({"status": 200, "blob": html});
                });
            });
        }
    } else if (req.params.name == "resourceEdit") {
        let id = req.query.resource;
        request('http://127.0.0.1:5000/api/resource/' + id, function (error, response, body) {
            request('http://127.0.0.1:5000/api/unit-list', function (error, response, body2) {

                req.app.render("resource-edit", {
                    resource: JSON.parse(body),
                    units: JSON.parse(body2)
                }, function (err, html2) {
                    res.json({"status": 200, "blob": html2});
                });
            });
        });
    } else if (req.params.name == "resourceCreate") {
        request('http://127.0.0.1:5000/api/unit-list', function (error, response, body) {
            req.app.render('resource-create', {units: JSON.parse(body)}, function (err, html) {
                res.json({"status": 200, "blob": html})
            });
        });
    } else if (req.params.name == "accountPane") {
		if (req.user) {
			request('http://127.0.0.1:5000/api/personnel/' + req.user.profile.oid, function (error, response, body) {
				req.app.render("account-pane", {personnel: JSON.parse(body)}, function (err, html) {
					res.json({"status": 200, "blob": html})
				});
			});
		} else {
			req.app.render("account-pane", {signInUrl: "/authorise/signin"}, function (err, html) {
				res.json({"status": 200, "blob": html});
			});
		}
    }
});


module.exports = router;
