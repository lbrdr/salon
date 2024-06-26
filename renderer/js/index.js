const serverURL = 'http://localhost:8080/'

var mainDiv
var secondaryDiv
var overlayDiv

// Initialization; Triggered at document load
async function init() {
	mainDiv = document.getElementById('main-div')
	secondaryDiv = document.getElementById('secondary-div')
	overlayDiv = document.getElementById('overlay-div')
	setPage('login')
	await checkToken()
}

function createRequest(method, customHeaders, options) {
			
	const request = new XMLHttpRequest()
	request.open(method, serverURL, true)
	
	for (header in customHeaders) {
		request.setRequestHeader(header, customHeaders[header])
	}
	
	if (options) {
		for (const option in options) {
			request[option] = options[option]
		}
	}
	
	return request
	
}

function performRequest(request, message) {
	
	return new Promise((resolve, reject) => {
		
		try {
			request.onreadystatechange = () => {
				if (request.readyState == 4) {
					resolve(request)
				}
			}
			
			request.send(message)
		} catch (error) {
			reject(error)
		}
	
	});
	
}

function encodeHTML(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function queryRequest(method, customHeaders, message, options) {
	
	const request = createRequest(method, customHeaders, options)

	await performRequest(request, message)
	
	return request
	
}

function enableField(field) {
	const fieldToggles = field.getElementsByClassName('field-toggle')
	
	for (const fieldToggle of fieldToggle) {
		fieldToggle.checked = true
	}
	
	for (const input of field.getElementsByTagName('input')) {
		input.disabled = false
	}
	
	for (const select of field.getElementsByTagName('select')) {
		select.disabled = false
	}
}

function toggleField(event, fieldToggle) {
	const field = fieldToggle.parentElement
	const disabled = !fieldToggle.checked
	
	for (const input of field.getElementsByTagName('input')) {
		if (input.className !== 'field-toggle') {
			input.disabled = disabled
		}
	}
	
	for (const select of field.getElementsByTagName('select')) {
		select.disabled = disabled
	}
	
	event.stopPropagation()
}

function uniqueFilter(value, index, array) {
	return array.indexOf(value) === index
}

function formatDate(date, modifier) {
	date = date ?
		new Date(date + ' ') :
		new Date()
		
	if (modifier) {
		modifier(date)
	}
		
	return date.toJSON()
}

function formatDateTime(dateTime, modifier) {
	dateTime = dateTime ?
		new Date(dateTime) :
		new Date()
		
	if (modifier) {
		modifier(dateTime)
	}
	
	return dateTime.toJSON()
}

function setToNextDay(date) {
	date.setDate(date.getDate() + 1)
}

function toLocalDateTime(date) {
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
	return date.toJSON().slice(0,19)
}


var systemTimeTimeout

function setSystemTime() {
	const timeDiv = document.getElementById('system-time')
	if (timeDiv) {
		timeDiv.innerText = 'System Time:\n' + (new Date()).toLocaleString()
		
		if (systemTimeTimeout) {
			clearTimeout(systemTimeTimeout)
		}
		
		systemTimeTimeout = setTimeout(setSystemTime, 500)
	}
}

