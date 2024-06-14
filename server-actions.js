const path = require('path')
const fs = require('fs')

const database = require('./database.js')
const {
	getRequestBody,
	checkPermission
} = require('./server-handlers.js')
const {
	tokens,
	generateToken,
	updateToken,
	verifyToken
} = require('./server-token.js')

// Actions that the server will handle
const actions = {
	
	'verify-token': function (req, res, log, headers) {
		
		const token = headers.token
		const { tokenError } = verifyToken(token, res)
		if (tokenError) {
			return
		}
		
		res.statusCode = 200
		res.end()
		
	},
	
	'test-user-actions': function (req, res, log, headers) {
		
		console.log(database.getUserActions())
		
		res.statusCode = 200
		res.end()
		
	},
	
}

// Import actions from modules
const modulesPath = path.resolve(__dirname, 'modules')
const dirents = fs.readdirSync(modulesPath, {withFileTypes: true})

for (const dirent of dirents) {
	if (dirent.isFile() && dirent.name.endsWith('.js')) {
		const fileName = dirent.name
		const filePath = path.resolve(modulesPath, fileName)
		
		const module = require(filePath)
		const moduleActions = module.actions
		for ( action in moduleActions ) {
			actions[action] = moduleActions[action]
		}
	}
}

module.exports = actions