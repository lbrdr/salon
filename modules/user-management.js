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
		return 'Username is required.'
	}
	
	if (!newUser.fullName) {
		return 'Full Name is required.'
	}
	
	if (
		newUser.userType !== 'admin' &&
		newUser.userType !== 'staff'
	) {
		return 'Invalid user type.'
	}
	
	
	
	if (
		oldUser &&
		currentUser.id !== oldUser.id &&
		oldUser.user_type === 'admin'
	) {
		console.log()
		
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
				'Please allow the said admin to disabled their own account.'
			);
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
		
		if (
			oldUser &&
			currentUser.id !== oldUser.id &&
			oldUser.user_type === 'admin'
		) {
			return (
				'The security questions of another admin cannot be changed. ' +
				'Please allow the said admin to change their own security questions.'
			);
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