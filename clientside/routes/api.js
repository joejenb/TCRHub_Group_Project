const request = require('request');
var passport = require('passport');
var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var app = express();

/*Got it so that when a user registers their details along with their hash and salt are stored. If a user then presses log in the 
html form posts the username and password, if successful this leads to the client being redirected to the home page*/
/* Basket Handling */

/* Get booking in basket */
router.get('/api/entity/basket/:id/:bid/', function(req, res, next) {
    if (res.app.locals.baskets[req.params.id] == undefined) {
        res.json({"status": 404});
    }
    else if (res.app.locals.baskets[req.params.id].length <= parseInt(req.params.bid)) {
        res.json({"status": 404});
    }
    else {
        res.json({"status": 200, "booking": res.app.locals.baskets[req.params.id][parseInt(req.params.bid)]});
    }
});

/* Get basket */
router.get('/api/entity/basket/:id/', function(req, res, next) {
    if (res.app.locals.baskets[req.params.id] == undefined) {
        res.app.locals.baskets[req.params.id] = [];
        res.json({"status": 200, "basket": []})
    }
    else {
        res.json({"status": 200, "basket": res.app.locals.baskets[req.params.id]});
    }
});

/* New Booking (+ basket if not extant) */
router.post('/api/entity/basket/:id/', function(req, res, next) {
    if (res.app.locals.baskets[req.params.id] == undefined) {
        res.app.locals.baskets[req.params.id] = [];
    }
    let bid = res.app.locals.baskets[req.params.id].length + 1;
    res.app.locals.baskets[req.params.id].push(req.body);

    // set id of booking
    res.app.locals.baskets[req.params.id][res.app.locals.baskets[req.params.id].length - 1]["id"] = bid;

    res.json({"status": 200, "bid": bid.toString()});
});

/* Delete Booking (+ basket if emptied) */
router.delete('/api/entity/basket/:id/:bid/', function(req, res, next) {
    console.log("Deleting");
    if (!res.app.locals.baskets[req.params.id]) {
        res.json({"status": 404});
    }
    else if (res.app.locals.baskets[req.params.id].length <= parseInt(req.params.bid)) {
        res.json({"status": 404});
    }
    else {
        res.app.locals.baskets[req.params.id].splice(parseInt(req.params.bid)-1, 1);
        res.json({"status": 200, "basket": res.app.locals.baskets[req.params.id]});
    }
});

/* Delete Basket (+ basket if emptied) */
router.delete('/api/entity/basket/:id/', function(req, res, next) {
    if (!res.app.locals.baskets[req.params.id]) {
        res.json({"status": 404});
    }
    else {
        res.app.locals.baskets[req.params.id] = [];
        res.json({"status": 200});
    }
});

router.get('/api/confirm-basket/:id', function(req, res, next) {
    if (res.app.locals.baskets[req.params.id] == undefined) {
        res.json({"status": 404});
    }
    else {
        res.app.locals.baskets[req.params.id].forEach( item => {
			item["bookedby"] = req.user.name;
			item["clientid"] = req.user.id;
			delete item["id"]
            request.post({url: 'http://127.0.0.1:5000/api/booking/', json: item}, function(error, response, body) {});
        });
    }
    res.json({"status": 404});
});

/* GET home page. */
router.get('/', function(req, res, next) {
	params = {}
	if (req.isAuthenticated()){
		params["client"] = req.user;
	}
    res.render('index', params);
});

/* Register endpoint */
router.post('/api/entity/register', async (req, res, next) => {
	let details = req.body;
	details["salt"] = crypto.randomBytes(32).toString('hex');
	details["hash"] = crypto.pbkdf2Sync(details["password"], details["salt"], 10000, 64, 'sha512').toString('hex');
	delete details["password"];

	request.post({url:'http://127.0.0.1:5000/api/client/', json: details}, function(error, response, body){
		if (body){
			res.json({"status": 200});
		} else{
			res.json({"status": 409});
		}
	});
});
	
/* Want to have a load block request for the log in and registration page, if logged in then they can't access either*/
router.post('/api/entity/login', function(req, res, next){
	passport.authenticate('local', function(error, user, info){
		if (user){
			req.login(user, function(err) {
				if (err) { return next(err); }
			});
			res.json({"status": 200});
		} else{
			res.json({"status": 409});
		}
	})(req, res, next);
});

router.get('/api/entity/logout', function(req, res, next) {
	req.logout();
	res.redirect('/');
});
	
router.get('/api/block/bookingForm/', (req, res) => {
    let id = req.query.rid;
    if (id == false) {
        res.json({"status": 200, "blob": '<div id="booking-form"></div>'});
    }
    else {
        request('http://127.0.0.1:5000/api/resource/' + id, function(error, response, body){
            req.app.render("book-form", { resource: JSON.parse(body) }, function (err, html) {
                res.json({"status": 200, "blob": html})
            });
        });
    }
});

router.get('/api/block/bookingInfo/', (req, res) => {
    let id = req.query.booking;
    if (id == false) {
        res.json({"status": 200, "blob": '<div id="booking-pane"></div>'});
    }
    else {
        request('http://127.0.0.1:5000/api/booking/' + id, function(error, response, body){
            req.app.render("booking-info", { booking: JSON.parse(body) }, function (err, html) {
                res.json({"status": 200, "blob": html})
            });
        });
    }
});


router.get('/api/block/clientInfo/', (req, res) => {
	req.app.render("account-view", { client: req.user, tab: "account-pane"}, function (err, html) {
		res.json({"status": 200, "blob": html})
	});
});

router.get('/api/block/bookingManage/', (req, res) => {
	req.app.render("account-view", { client: req.user, tab: "bookings-management"}, function (err, html) {
		res.json({"status": 200, "blob": html})
	});
});

router.get('/api/block/bookingList/', (req, res) => {
	request('http://127.0.0.1:5000/api/client-bookings/' + req.user.name, function(error, response, body){
		req.app.render("booking-list", {bookings: JSON.parse(body)}, function (err, html) {
			res.json({"status": 200, "blob": html})
		});
	});
});

router.get('/api/block/bookingCalendar/', (req, res) => {
	req.app.render("account-view", { client: req.user, tab: "bookings-calendar"}, function (err, html) {
		res.json({"status": 200, "blob": html})
	});
});

router.get('/api/block/registrationForm/', (req, res) => {
    if (!req.isAuthenticated()){
		req.app.render("registration-form", {}, function (err, html) {
			res.json({"status": 200, "blob": html})
		});
	} else{
		res.redirect('/');
	};
});

router.get('/api/block/loginForm/', (req, res) => {
    if (!req.isAuthenticated()){
		req.app.render("login-form", {}, function (err, html) {
			res.json({"status": 200, "blob": html})
		});
	} else{
		res.redirect('/');
	};
});
		

router.get('/api/block/basketList/', (req, res) => {
    let id = req.query.basket;

    req.app.render("basket-list", {basket_id:id, basket: res.app.locals.baskets[id] }, function (err, html) {
        res.json({"status": 200, "blob": html})
    });
});

router.get('/api/block/basketItemInfo/', (req, res) => {
    let bid = req.query.basket;
    let iid = req.query.item;

    req.app.render("basket-item-info", {"basket_id":bid, "item": res.app.locals.baskets[bid.toString()][iid-1] }, function (err, html) {
        res.json({"status": 200, "blob": html})
    });
});


router.get('/api/entity/auth', (req, res) => {
    if (req.isAuthenticated()){
        return res.send({success: "true"});
    }
    res.send({success: "false"});
});

module.exports = router;
