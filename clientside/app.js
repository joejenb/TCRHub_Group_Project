require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var request = require('request');
var crypto = require('crypto');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user["id"]);
});

passport.deserializeUser(async function(id, done){
	await request('http://127.0.0.1:5000/api/client/' + id, function(error, response, body) {
		user = JSON.parse(body);
		done(null, user);
	});
});

passport.use(new LocalStrategy(
	function(username, password, done){
		request('http://127.0.0.1:5000/api/client/' + username, function(error, response, body){
			user = JSON.parse(body);
			if (user){
				var hash = crypto.pbkdf2Sync(password, user["salt"], 10000, 64, 'sha512').toString('hex');
				if (hash === user["hash"]){
					return done(null, user);
				} else {
					return done(null, false);
				}
			} else{
				return done(null, false);
			}
		});
	}
));

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	unset: 'destroy'
}));

//app.listen(3639);

app.locals.baskets = {};

// view engine setup

nunjucks.configure('views', {
    autoescape: true,
    cache: false,
    express: app,
});
app.set('view engine', 'html');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
