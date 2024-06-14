const http = require('http')
const util = require('util')

const { Log, fg, bg, sgr } = require('./server-logs.js')

const actions = require('./server-actions')

const port = 8080

const options = {
}

var processes = 0

// Create the server
const server = http.createServer(options, async function(req, res) {
	
	// Get request details
	const socket = req.socket
	const headers = req.headers
	const key = headers.key
	const action = headers.action
	
	// Get process no.
	const processId = processes++
	
	// Create log function
	log = Log(processId)
	
	req.on('error', () => {
		log(sgr(fg.red) + 'Request Error:' + sgr(0) + ' ' + util.inspect(err, {colors: true}))
	})
	req.on('aborted', () => {
		log(sgr(fg.brightRed) + 'Request aborted' + sgr(0))
	})
	req.on('close', () => {
		log(sgr(fg.brightRed) + 'Request closed' + sgr(0))
	})
	req.on('end', () => {
		log(sgr(fg.brightRed) + 'Request ended' + sgr(0))
	})
	
	res.on('error', () => {
		log(sgr(fg.red) + 'Response Error:' + sgr(0) + ' ' + util.inspect(err, {colors: true}))
	})
	res.on('aborted', () => {
		log(sgr(fg.brightRed) + 'Response aborted' + sgr(0))
	})
	res.on('close', () => {
		log(sgr(fg.brightRed) + 'Response closed' + sgr(0))
	})
	res.on('end', () => {
		log(sgr(fg.brightRed) + 'Response ended' + sgr(0))
	})
		
	// Log request details
	log(
		sgr(fg.brightYellow) + 'Request recieved:' + sgr(0) + ' ' +
		sgr(fg.brightCyan) + socket.remoteAddress + sgr(0) + ':' +
		sgr(fg.brightBlue) + socket.remotePort + sgr(0)
		// ' (' + client + ')'
	)
		
	log(
		'Socket: ' + JSON.stringify(socket, [
			'localAddress',
			'localPort',
			'localFamily',
			'remoteAddress',
			'remoteFamily',
			'remotePort',
		], 4) +
		'\nHeaders: ' + JSON.stringify(headers, null, 4) +
		'\nMethod: ' + req.method +
		'\nURL: ' + req.url,
		true
	)
	
	
	if (action) {
	
		const func = actions[action]
		
		if (func) {
				
			log(sgr(fg.brightYellow) + 'Task started:' + sgr(0) + ' ' + action)
			
			const processInitDate = Date.now()
			
			try {
				
				await func(req, res, log, headers)
				
				log(sgr(fg.brightYellow) + 'Task done' + sgr(0))
					
			} catch (error) {
				
				res.statusCode = 500
				res.statusMessage = "Server-side Error"
				res.end()
				
				log(sgr(fg.brightRed) + 'Task failed:' + sgr(0) + ' ' + util.inspect(error, {colors: true}))
				
			}
				
			
		} else {
			
			res.statusCode = 406;
			res.statusMessage = 'Unknown action.'
			res.end()
			
			log(sgr(fg.yellow) + 'Unknown action' + sgr(0))
			
		}
		
	} else {
		res.end()
	}
	
})

// Start the server
server.listen(port)

console.log('Listening on ' + port)