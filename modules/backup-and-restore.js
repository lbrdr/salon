const database = require('../database.js')
const {
	getRequestBody,
	getRequestBodyAsBuffer,
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
	
	'backup-and-restore-backup-data': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const data = database.backupData()
		
		database.createUserAction(user.id, 'Created backup data')
		
		res.statusCode = 200
		res.end(data)
		
	},
	
	'backup-and-restore-restore-data': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const data = await getRequestBodyAsBuffer(req);
		
		const restoreError = database.restoreData(data)
		
		if (restoreError) {
			res.statusCode = 204
			res.statusMessage = restoreError
			res.end()
			return
		}
		
		for (const token in tokens) {
			tokens[token] = 0
		}
		
		database.createUserAction(user.id, 'Restored backup data')
		
		res.statusCode = 200
		res.statusMessage = 'Backup data has been restored successfully.'
		res.end()
		
	},
	
}



module.exports = {
	actions
}