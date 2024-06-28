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


function checkUserInfo(currentUser, newUser, securityQuestions, oldUser) {
	
	if (!newUser.username) {
		return 'The username is required.'
	}
	
	if (newUser.username.length > 16) {
		return 'The username is too long. The username cannot be more than 16 characters long.'
	}
	
	if (newUser.password) {
		if (newUser.password.length < 8) {
			return 'The password is too short. The password must be at least 8 characters long.'
		}
	}
	
	if (!newUser.fullName) {
		return 'The full name is required.'
	}
	
	if (
		newUser.userType !== 'admin' &&
		newUser.userType !== 'staff'
	) {
		return 'Invalid user type.'
	}
	
	if (oldUser) {
		
		if (oldUser.user_type ==='admin') {
			
			if (currentUser.id !== oldUser.id) {
				
				if (oldUser.user_type !== newUser.userType) {
					return (
						'The user type of another admin cannot be changed. ' +
						'Please allow the said admin to change their own user type.'
					);
				}
				
				if (newUser.password) {
					return (
						'The password of another admin cannot be changed. ' +
						'Please allow the said admin to change their own password.'
					);
				}
				
				if (!oldUser.disabled && newUser.disabled) {
					return (
						'The account of another admin cannot be disabled. ' +
						'Please allow the said admin to disable their own account.'
					);
				}
		
				if (securityQuestions.length) {
					return (
						'The security question of another admin cannot be changed. ' +
						'Please allow the said admin to change their own security question.'
					);
				}
				
			}
			
			const users = database.getUsers()
			
			if (
				newUser.userType !== 'admin' &&
				users.filter((user) => user.user_type === 'admin').length == 1
			) {
				return 'The user type cannot be set because no admin user will be left in the system.'
			}
			
			if (
				!oldUser.disabled &&
				newUser.disabled &&
				users.filter(
					(user) =>
						user.user_type === 'admin' &&
						!user.disabled
				).length == 1
			) {
				return 'The user account cannot be disabled because no admin user will be able to login.'
			}
			
		}
		
	}
	
	for (const securityQuestion of securityQuestions) {
		const {
			question,
			answer
		} = securityQuestion
		
		if (!question) {
			return 'The question for the security question cannot be blank.'
		}
		
		if (!answer) {
			return 'The answer for the security question cannot be blank.'
		}
	}
	
}



function setUserSecurityQuestions(userID, securityQuestions) {
		
	const oldQuestionIDs = database.getSecurityQuestionsByUserID(userID).map(
		(securityQuestion) => securityQuestion.id
	);
	const emptyQuestionIDs = database.getEmptySecurityQuestions().map(
		(securityQuestion) => securityQuestion.id
	);
	
	questionIDs = oldQuestionIDs.concat(emptyQuestionIDs)
	console.log(questionIDs)
	
	var i = 0
	var securityQuestionID = questionIDs[i]
	
	for (const securityQuestion of securityQuestions) {
		
		const {
			question,
			answer
		} = securityQuestion
		
		if (securityQuestionID) {
			database.setSecurityQuestion(securityQuestionID, userID, question, answer)
		} else {
			database.createSecurityQuestion(userID, question, answer)
		}
		
		i++
		securityQuestionID = questionIDs[i]
		
	}
	
	while (securityQuestionID) {
		database.setSecurityQuestion(securityQuestionID, null, null, null)
		
		i++
		securityQuestionID = questionIDs[i]
	}
	
}


// Actions that the server will handle
const actions = {
	
	'user-management-get-users': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const users = database.getUsers().map(
			(resultUser) => ({
				id: resultUser.id,
				username: resultUser.username,
				fullName: resultUser.full_name,
				userType: resultUser.user_type,
				disabled: resultUser.disabled
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(users))
		
	},
	
	'user-management-get-user-by-username': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const username = await getRequestBody(req);
		
		const resultUser = database.getUserByUsername(username)
		
		if (!resultUser) {
			res.statusCode = 204
			res.statusMessage = 'User not found.'
			res.end()
			return
		}
		
		const userResponse = {
			fullName: resultUser.full_name,
			userType: resultUser.user_type,
			disabled: resultUser.disabled
		}
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(userResponse))
		
	},
	
	'user-management-get-security-questions-by-user-id': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const userID = await getRequestBody(req);
		
		const securityQuestions = database.getSecurityQuestionsByUserID(userID).map(
			(securityQuestion) => ({
				question: securityQuestions.question,
				answer: securityQuestions.answer
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(securityQuestions))
		
	},
	
	'user-management-register-user': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const { newUser, securityQuestions } = JSON.parse(requestBody);
		
		const {
			username,
			password,
			userType,
			fullName,
			disabled
		} = newUser
		
		const oldUser = database.getUserByUsername(username)
		
		var userError
		
		if (!password) {
			userError = 'Password is required.'
		} else if (oldUser) {
			userError = 'A user with the same username already exists.'
		} else {
			userError = checkUserInfo(user, newUser, securityQuestions)
		}
		
		if (userError) {
			res.statusCode = 204
			res.statusMessage = userError
			res.end()
			return
		}
		
		const createResult = database.createUser(
			username,
			password || editedUser.password,
			userType,
			fullName,
			disabled ? 1 : null
		)
		
		const userID = createResult.lastInsertRowid
		
		setUserSecurityQuestions(userID, securityQuestions)
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Registered user: ' +
			JSON.stringify({
				id: userID,
				username,
				userType,
				fullName,
				disabled: disabled ? 1 : null
			})
		)
		
		res.statusCode = 200
		res.statusMessage = 'The user has been successfully registered.'
		res.end()
		
	},
	
	'user-management-edit-user': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const { newUser, securityQuestions } = JSON.parse(requestBody);
		
		const {
			username,
			password,
			userType,
			fullName,
			disabled
		} = newUser
		
		var userError
		
		const oldUser = database.getUserByUsername(username)
		
		if (!oldUser) {
			userError = 'Invalid username.'
		} else {
			userError = checkUserInfo(user, newUser, securityQuestions, oldUser)
		}
		
		if (userError) {
			res.statusCode = 204
			res.statusMessage = userError
			res.end()
			return
		}
		
		const userID = oldUser.id
		
		database.setUser(
			userID,
			username,
			password || oldUser.password,
			userType,
			fullName,
			disabled ? 1 : null
		)
		
		if (securityQuestions.length) {
			setUserSecurityQuestions(userID, securityQuestions)
		}
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Edited user: ' +
			JSON.stringify({
				id: userID,
				username,
				userType,
				fullName,
				disabled: disabled ? 1 : null
			})
		)
		
		res.statusCode = 200
		res.statusMessage = 'The user ' + username + ' has been successfully edited.'
		res.end()
		
	},
	
}



module.exports = {
	actions
}