var currentUser = {}
var token

async function checkToken(request) {
	
	var tokenError
	
	if (!request) {
		
		if (!token) {
			
			if (currentPage !== 'login') {
				setPage('login')
				tokenError = 'No login token.'
			}
			
		} else {
			
			request = await queryRequest(
				'POST',
				{action: 'verify-token', token},
			);
			
		}
		
	} else if (request.status === 200) {
		
		token = request.getResponseHeader('token')
		currentUser = JSON.parse(request.getResponseHeader('user'))
		
		if (currentPage === 'login') {
			setPage('home')
		}
		
	} else if (request.status === 204) {
		
		if (
			request.statusText === 'Login token not recognized.' ||
			request.statusText === 'Login token has expired.'
		) {
			token = undefined
			currentUser = {}
			
			if (currentPage !== 'login') {
				tokenError = request.statusText + ' You have been logged out.'
				setPage('login')
			}
		}
		
	} else if (request.status === 406) {
		
		createMessageDialogue('error', 'Request Failed', 'Client-side error')
		return request.statusText
		
	} else if (request.status === 500) {
		
		createMessageDialogue('error', 'Request Failed', request.statusText)
		return request.statusText
		
	} else {
		
		const connectionError = 'Could not connect to server.'
		createMessageDialogue('error', 'Connection Failed', connectionError)
		return connectionError
		
	}
	
	if (tokenError) {
		createMessageDialogue('error', 'Token Error', tokenError)
	}
	
	return tokenError
	
}