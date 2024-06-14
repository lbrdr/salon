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

function createRequest(method, customHeaders) {
			
	const request = new XMLHttpRequest()
	request.open(method, serverURL, true)
	
	for (header in customHeaders) {
		request.setRequestHeader(header, customHeaders[header])
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

async function queryRequest(method, customHeaders, message) {
	
	const request = createRequest(method, customHeaders)

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