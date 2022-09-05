require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var logger = require('morgan');
var nunjucks = require('nunjucks');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var graph = require('./graph');
var request = require('request');

const oauth2 = require('simple-oauth2').create({
  client: {
    id: process.env.APP_ID,
    secret: process.env.APP_PASSWORD
  },
  auth: {
    tokenHost: process.env.AUTHORITY,
    authorizePath: process.env.AUTHORIZE_ENDPOINT,
    tokenPath: process.env.TOKEN_ENDPOINT
  }
});


async function get_user(id){
  let body = await request('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
  });
  console.log(body);
}

function update_session(id, session){
  request.put({url: 'http://127.0.0.1:5000/api/personnel/' + id, json: {"session": session}}, function (error, response, body) {
  });
}

// Passport calls serializeUser and deserializeUser to
// manage users
passport.serializeUser(async function(user, done) {
  // Use the OID property of the user as a key
  //users[user.profile.oid] = user;
  await update_session(user.profile.oid, user);
  done (null, user.profile.oid);
});

passport.deserializeUser(async function(id, done) {
  await request('http://127.0.0.1:5000/api/personnel/' + id, function (error, response, body) {
    body = JSON.parse(body);
    console.log(body["id"]);
    done(null, body["session"]);
  });
});

// Callback function called once the sign-in is complete
// and an access token has been obtained
async function signInComplete(iss, sub, profile, accessToken, refreshToken, params, done) {
  if (!profile.oid) {
    return done(new Error("No OID found in user profile."), null);
  }

  try{
    const user = await graph.getUserDetails(accessToken);

    if (user) {
      // Add properties to profile
      profile['email'] = user.mail ? user.mail : user.userPrincipalName;
    }
  } catch (err) {
    done(err, null);
  }

  // Create a simple-oauth2 token from raw tokens
  let oauthToken = oauth2.accessToken.create(params);

  // Save the profile and tokens in user storage
  //users[profile.oid] = { profile, oauthToken };
  return done(null, {profile, oauthToken});
}

// Configure OIDC strategy
passport.use(new OIDCStrategy(
  {
    identityMetadata: `${process.env.AUTHORITY}${process.env.ID_METADATA}`,
    clientID: process.env.APP_ID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: process.env.REDIRECT_URI,
    allowHttpForRedirectUrl: true,
    clientSecret: process.env.APP_PASSWORD,
    validateIssuer: false,
    passReqToCallback: false,
    scope: process.env.APP_SCOPES.split(' ')
  },
  signInComplete
));

var indexRouter = require('./routes/index');
var authorise = require('./routes/authorise');
var apiRouter = require('./routes/api');

var app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  unset: 'destroy'
}));


// view engine setup
nunjucks.configure('views', {
    autoescape: true,
    cache: false,
    express: app,
});
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req, res, next) {
  // Set the authenticated user in the
  // template locals
  if (req.user) {
    res.locals.user = req.user.profile;
  }
  next();
});

app.use('/', apiRouter);
app.use('/', indexRouter);
app.use('/authorise', authorise);

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
