var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/signin',
	function	(req, res, next) {
		/*States that passport will authenticate using the azuread... strategy which is defined/added as middleware in app.js*/
		passport.authenticate('azuread-openidconnect',
			{
				response: res,
				prompt: 'login',
				failureRedirect: '/',
				failureFlash: false,
				successRedirect: '/'
			}
		)(req,res,next);
	}
);

router.post('/',
	function(req, res, next) {
		passport.authenticate('azuread-openidconnect',
			{
				response: res,
				failureRedirect: '/',
				failureFlash: false,
				successRedirect:'/'
			}
		)(req,res,next);
	}
);

router.get('/signout',
	function(req, res) {
		req.session.destroy(function(err) {
			req.logout();
			res.redirect('/');
		});
	}
);

module.exports = router;
