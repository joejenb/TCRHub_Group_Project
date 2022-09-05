//require('dotenv').config()
const express = require('express');
const router = express.Router();
const app = express();
const bcrypt = require('bcrypt-nodejs');
//const passport = require('passport');
//const flash = require('express-flash');
//const session = require('express-session');
const request = require('request-promise');

//const init_passport = require('./passport_config');
//init_passport(passport,
//	usr_name => {
		/* Check that user exists in database */
//		return users.find(user => user.usr_name === usr_name)
//	},
//	id => {
		/* Get the data stored in the session associated with the clients id */
//		return users.find(user => user.usr_name === id)
//	}
//);

app.use(express.static('clientside'));
app.use(express.urlencoded({extended: false}));
//app.use(flash());
/*Unique client id is stored on their computer. Session itself is stored server side
and can then be identified by clients id. Session secret signs and/or encrypts cookies to prevent tampering*/
//app.use(session({
//	secret: process.env.SESSION_SECRET,
//	resave: false,
//	saveUninitialized: false
//}));
//app.use(passport.initialize());
//app.use(passport.session());

/* Not working
router.post('/api/entity/login', passport.authenticate('local', {
	successRedirect: '/'}));
*/



module.exports = router;
