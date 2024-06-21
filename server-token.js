const crypto = require('crypto')

const database = require('./database.js')



// How long a token would be valid for from the last action (in milliseconds)
const tokenValidityDuration = 60 * 60 * 1000 // (1 hour)

// This will contain the tokens for keeping track of 
const tokens = {
	// <token>: { <username>, <expiry> }
}

// Function for generating a token
function generateToken(username, res) {

	var token
	
	do {
		const salt = Math.random().toString() + Date.now() + username
		token = crypto.createHash('sha256').update(salt).digest('hex');
	} while (tokens[token])
		
	const tokenData = {
		username: username
	}
	tokens[token] = tokenData
	updateToken(token)
	
	return token
	
}

// Function for updating a token
function updateToken(token) {
	tokens[token].expiry = Date.now() + tokenValidityDuration
}

// Function for verifying token
function verifyToken(token, res) {
	
	var tokenError, user
	
	const tokenData = tokens[token]
	
	if (!tokenData) {
		tokenError = 'Login token not recognized.'
	} else if (token.expiry < Date.now()) {
		tokenError = 'Login token has expired.'
	} else {
		// Check if user connected to the token still exists
		const username = tokenData.username
		user = database.getUserByUsername(username)
		
		if (!user) {
			tokenError = 'Login token has expired.'
			tokens[token].expiry = 0
		} else {
			if (res) {
				res.setHeader('token', token)
				res.setHeader('user', JSON.stringify({
					id: user.id,
					username: username,
					userType: user.user_type,
					fullName: user.full_name
				}))
			}
		}
		
	}
	
	if (tokenError) {
		res.statusCode = 204
		res.statusMessage = tokenError
		res.end()
	}
	
	return { tokenError, user }
	
}



module.exports = {
	tokens,
	generateToken,
	updateToken,
	verifyToken
}