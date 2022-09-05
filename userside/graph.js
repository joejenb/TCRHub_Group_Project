var graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

module.exports = {
	getUserDetails: async function(accessToken) {
		const client = getAuthenticatedClient(accessToken);

		const user = await client.api('/me').get();
		return user;
	},
	addNewUser: async function(accessToken, name, first_name, email, pass) {
		const client = getAuthenticatedClient(accessToken);
		const user = {
			accountEnabled: true,
			displayName: name,
			mailNickname: first_name,
			userPrincipalName: email,
			"passwordProfile" : {
				forceChangePasswordNextSignIn: true,
				password: pass 
			}
		};

		let new_res = await client.api('/users')
			.post(user)
			.catch(error => {
				console.log(error);
			});
	
		if (new_res){
			const userObject = {
				"@odata.id": `https://graph.microsoft.com/v1.0/users/${new_res.id}`
			};
			let admin_id = 'ba971bda-3803-4628-b8a2-8f96091724dd'//95abb858-3ccd-439f-b731-914fb74b06f8'
			let roll_res = await client.api(`/directoryRoles/${admin_id}/members/$ref`)
				.post(userObject)
				.catch(error => {
					console.log(error);
				});
		}

		return new_res;
	}
};

function getAuthenticatedClient(accessToken) {
	// Initialize Graph client
	const client = graph.Client.init({
		// Use the provided access token to authenticate
		// requests
		authProvider: (done) => {
			done(null, accessToken);
		}
	});

	return client;
}
