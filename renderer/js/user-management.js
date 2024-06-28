var umUserData
var umUserTable



function umCheckInputValues(newUser, confirmPassword, securityQuestions) {

	const {
		username,
		fullName,
		password,
		userType,
		disabled
	} = newUser
	
	if (password !== confirmPassword) {
		return 'Password and confirm password do not match.'
	}
	
	for (const securityQuestion of securityQuestions) {
		const {
			question,
			answer
		} = securityQuestion
		
		if (
			!question && answer ||
			question && !answer
		) {
			return 'Security question and answer must both be present or both be blank.'
		}
	}
	
}

function umGetInputValues(action) {
	const username = document.getElementById(`user-${action}-username`).value
	const fullName = document.getElementById(`user-${action}-full-name`).value
	const userType = document.getElementById(`user-${action}-user-type`).value
	const password = document.getElementById(`user-${action}-password`).value
	const confirmPassword = document.getElementById(`user-${action}-confirm-password`).value
	const disabled = document.getElementById(`user-${action}-disabled`).value
	const question = document.getElementById(`user-${action}-security-question`).value
	const answer = document.getElementById(`user-${action}-security-question-answer`).value
	
	const newUser = {
		username,
		fullName,
		password,
		userType,
		disabled
	}
	
	const securityQuestions = []
	
	if (question || answer) {
		securityQuestions.push({ question, answer })
	}
	
	const inputError = umCheckInputValues(newUser, confirmPassword, securityQuestions)
	
	return [ inputError, newUser, securityQuestions ]
	
}


async function umSetupUserTable() {
	
	const userRequest = await queryRequest(
		'POST',
		{
			action: 'user-management-get-users',
			token
		},
	);
	
	{
		const tokenError = await checkToken(userRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(userRequest)
		if (permissionError) { return permissionError; }
	}
	
	umUserData = JSON.parse(userRequest.responseText)
	
	umUserData.forEach(
		(user) => {
			user.login = user.disabled ? 'Disabled' : 'Enabled'
		}
	);
	
	const users = [...umUserData]
	
	users.sort(
		(a, b) => b.id - a.id
	)
	
	if (umUserTable) {
		umUserTable.setData(users)
		return
	}
	
	const tableDiv = document.getElementById('user-table')
	
	umUserTable = createTable(
		tableDiv,
		{
			id: 'ID',
			username: 'Username',
			fullName: 'Full Name',
			userType: 'User Type',
			login: 'Login'
		},
		users,
		{
			itemsPerPage: 7,
			select: true
		}
	)
	
}



function umRegisterUser() {
	
	setSecondary('user-registration')
	
}

async function umSubmitRegistration() {
	
	const [ inputError, newUser, securityQuestions ] = umGetInputValues('registration')
	
	if (inputError) {
		createMessageDialogue('error', 'User Registration Failed', inputError)
		return
	}
	
	const registerRequest = await queryRequest(
		'POST',
		{
			action: 'user-management-register-user',
			token
		},
		JSON.stringify({
			newUser,
			securityQuestions
		})
	);
	
	{
		const tokenError = await checkToken(registerRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(registerRequest)
		if (permissionError) { return; }
	}
	
	if (registerRequest.status === 200) {
		createMessageDialogue('success', 'User Registration Successful', registerRequest.statusText)
		setPage('user-management')
		return
	}
	
	createMessageDialogue('error', 'User Registration Failed', registerRequest.statusText)
	
}

function umCancelRegistration() {
	clearSecondary()
}



async function umEditUser(selectedUser) {
	
	setSecondary('user-edit')
	
	if (selectedUser) {
		document.getElementById('user-edit-username').value = selectedUser.username
		await umCheckUsername()
	}
	
}

async function umSubmitEdit() {
	
	const [ inputError, newUser, securityQuestions ] = umGetInputValues('edit')
	
	if (inputError) {
		createMessageDialogue('error', 'User Edit Failed', inputError)
		return
	}
	
	const editRequest = await queryRequest(
		'POST',
		{
			action: 'user-management-edit-user',
			token
		},
		JSON.stringify({
			newUser,
			securityQuestions
		})
	);
	
	{
		const tokenError = await checkToken(editRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(editRequest)
		if (permissionError) { return; }
	}
	
	if (editRequest.status === 200) {
		createMessageDialogue('success', 'User Edit Successful', editRequest.statusText)
		
		// if (currentUser.username === newUser.username) {
			// token = undefined
			// currentUser = undefined
			// setPage('login')
			// createMessageDialogue('warning', 'Logout Notice', 'Your user account has been edited. You have been logged out.')
			// return
		// }
		
		await umSetupUserTable()
		clearSecondary()
		return
	}
	
	createMessageDialogue('error', 'User Edit Failed', editRequest.statusText)
	
}

async function umCheckUsername() {
	
	const username = document.getElementById('user-edit-username').value
	
	if (!username) {
		createMessageDialogue('error', 'Username Check Failed', 'Username is required.')
		return
	}
	
	const userRequest = await queryRequest(
		'POST',
		{
			action: 'user-management-get-user-by-username',
			token
		},
		username
	);
	
	{
		const tokenError = await checkToken(userRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(userRequest)
		if (permissionError) { return; }
	}
	
	if (userRequest.status !== 200) {
		createMessageDialogue('error', 'Username Check Failed', userRequest.statusText)
		return
	}
	
	const editedUser = JSON.parse(userRequest.responseText)
	
	const {
		fullName,
		userType,
		disabled
	} = editedUser
	
	document.getElementById('user-edit-full-name').value = fullName
	document.getElementById('user-edit-user-type').value = userType
	document.getElementById('user-edit-password').value = ''
	document.getElementById('user-edit-confirm-password').value = ''
	document.getElementById('user-edit-disabled').value = disabled ? '1' : ''
	document.getElementById('user-edit-security-question').value = ''
	document.getElementById('user-edit-security-question-answer').value = ''
	
}

function umCancelEdit() {
	clearSecondary()
}



function umClearData() {
	umUserData = undefined
	umUserTable = undefined
}