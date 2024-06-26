const database = require('./database.js')



// Function for getting the body of an http request
function getRequestBody(req) {
	return new Promise((resolve, reject) => {
		var content = ''
		req.setEncoding('utf8')
		req.on('data', (data) => {content += data})
		req.on('end', () => {resolve(content)})
	});
}



// Function for getting the body of an http request as a buffer
function getRequestBodyAsBuffer(req) {
	return new Promise((resolve, reject) => {
		const chunks = []
		req.on('data', (data) => {chunks.push(data)})
		req.on('end', () => {resolve(Buffer.concat(chunks))})
	});
}



// Function for verifying user permission
function checkPermission(userType, permissions, res) {
	
	var permissionError
	
	if (permissions.indexOf(userType) === -1) {
		permissionError = 'User has insufficient permission.'
	}
	
	if (res && permissionError) {
		res.statusCode = 204
		res.statusMessage = permissionError
		res.end()
	}
	
	return { permissionError }
	
}



module.exports = {
	getRequestBody,
	getRequestBodyAsBuffer,
	checkPermission
}