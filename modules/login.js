const database = require('../database.js')
const {
	getRequestBody,
	checkPermission
} = require('../server-handlers.js')
const {
	tokens,
	generateToken,
	updateToken,
	verifyToken
} = require('../server-token.js')



// Actions that the server will handle
const actions = {
	
	'login': async function (req, res, log, headers, body) {
	
		// Receive the http request body
		const requestBody = await getRequestBody(req);
		
		const loginInfo = JSON.parse(requestBody)
		const username = loginInfo.username
		const user = database.getUserByUsername(username)
		
		if (!user || user.password !== loginInfo.password) {
			res.statusCode = 204
			res.statusMessage = 'Invalid credentials'
			res.end()
			return
		}
		
		const token = generateToken(username)
		const { tokenError } = verifyToken(token, res)
		if (tokenError) {
			return
		}
		
		database.createUserAction(user.id, 'Logged In')
		
		res.statusCode = 200
		res.end()
	
	},
	
	
	
	'logout': async function (req, res, log, headers, body) {
		
		const token = headers.token
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) {
			return
		}
		
		tokens[token].expiry = 0
		
		database.createUserAction(
			user.id,
			'Logged Out'
		)
		
		res.statusCode = 200
		res.end()
	
	},

}



module.exports = {
	actions
}