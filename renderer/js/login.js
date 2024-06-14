async function login() {
	
	const username = document.getElementById('username').value
	const password = document.getElementById('password').value
	
	const loginRequest = await queryRequest(
		'POST',
		{action: 'login'},
		JSON.stringify({
			username,
			password
		}),
	);
	
	if (loginRequest.status === 200) {
		checkToken(loginRequest)
		return
	}
	
	if (loginRequest.status === 204) {
		createMessageDialogue('error', 'Login Failed', loginRequest.statusText)
		return
	}
	
	if (loginRequest.status === 500) {
		createMessageDialogue('error', 'Request Failed', loginRequest.statusText)
		return
	}
	
	createMessageDialogue('error', 'Connection Failed', 'Could not connect to server')
	
}

async function logout() {
	
	const logoutRequest = await queryRequest(
		'POST',
		{
			action: 'logout',
			token: token
		}
	);
	
	if (logoutRequest.status === 200) {
		token = undefined
		currentUser = undefined
		setPage('login')
		createMessageDialogue('success', 'Logout Success', 'The user was logged out successfully.')
		return
	}
	
	const tokenError = await checkToken(logoutRequest)
	if (tokenError) { return }
	
	createMessageDialogue('error', 'Logout Failed', 'Server-side Error')
	
}