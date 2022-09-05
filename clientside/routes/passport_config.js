const local_strategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, get_usr_by_name, get_usr_by_id){
	const auth_usr = async (usr_name, password, done) => {
		/* Gets user details from db, if valid username then compares stored hashed
		password with the one entered (having also been hashed). If either incoorect 
		then returns appropriate message*/
		const user = get_usr_by_name(usr_name)
		if (user === null){
			return done(null, false, {message: 'No user with that user name'})
		}
		
		try{
			if (await bcrypt.compare(password, user.password)){
				return done(null, user)
			}
			else {
				return done(null, false, {message: 'Incorrect password'})
			}
		}catch (e){
			return done(e)
		}
	}
	passport.use(new local_strategy({usernameField: 'usr_name'}, auth_usr))
	passport.serializeUser((user, done) => done(null, user.id))
	passport.deserializeUser((id, done) => {
		return done(null, get_usr_by_id(id))
	})

}

module.exports = initialize
