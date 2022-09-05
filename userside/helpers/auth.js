const credentials = {
	client: {
		id: process.env.APP_ID,
		secret: process.env.APP_PASSWORD,
	},
	auth: {
		tokenHost: 'https://login.microsoftonline.com',
		authorizePath: 'common/oauth2/v2.0/authorize',
		tokenPath: 'common/oauth2/v2.0/token'
	}
};

const oauth2 = require('simple-oauth2').create(credentials);
const jwt = require('jsonwebtoken');

function getAuthUrl() {
	const returnVal = oauth2.authorizationCode.authorizeURL({
		redirect_uri: process.env.REDIRECT_URI,
		scope: process.env.APP_SCOPES
	});
	console.log(`Generated auth url: ${returnVal}`);
	return returnVal;
}

async function getTokenFromCode(auth_code, res) {
	let result = await oauth2.authorizationCode.getToken({
		code: auth_code,
		redirect_uri: process.env.REDIRECT_URI,
		scope: process.env.APP_SCOPES
	});

	const token = oauth2.accessToken.create(result);
	console.log('Token created: ', token.token);
	saveValuesToCookie(token, res);
	return token.token.access_token;
}

function clearCookies(res) {
	// Clear cookies
	res.clearCookie('graph_access_token', {maxAge: 3600000, httpOnly: true});
	res.clearCookie('graph_user_name', {maxAge: 3600000, httpOnly: true});
}


function saveValuesToCookie(token, res) {
	// Parse the identity token
	const user = jwt.decode(token.token.id_token);

	// Save the access token in a cookie
	res.cookie('graph_access_token', token.token.access_token, {maxAge: 3600000, httpOnly: true});
	// Save the user's name in a cookie
	res.cookie('graph_user_name', user.name, {maxAge: 3600000, httpOnly: true});
	// Save the refresh token in a cookie
	res.cookie('graph_refresh_token', token.token.refresh_token, {maxAge: 7200000, httpOnly: true});
	// Save the token expiration tiem in a cookie
	res.cookie('graph_token_expires', token.token.expires_at.getTime(), {maxAge: 3600000, httpOnly: true});
}

exports.getAuthUrl = getAuthUrl;
exports.getTokenFromCode = getTokenFromCode;
exports.clearCookies = clearCookies;
