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



// Functions for forgot password
function fpCheckUser(username, res) {
	
	var userError
	var securityQuestions
	
	const user = database.getUserByUsername(username)
	
	if (!user || user.disabled) {
		userError = 'Invalid username.'
	} else {
		securityQuestions = database.getSecurityQuestionsByUserID(user.id).filter(
			(securityQuestion) => securityQuestion.question && securityQuestion.answer
		)
		
		if (!securityQuestions.length) {
			userError = 'User does not have security question for recovery. Please contact an administrator to recover your account.'
		}
	}
	
	if (userError) {
		res.statusCode = 204
		res.statusMessage = userError
		res.end()
	}
	
	return {
		userError,
		securityQuestions,
		user
	}
	
}



function fpCheckAnswers(securityQuestions, answers, res) {
	
	var answersError
	
	for (var i = 0; i < securityQuestions.length; i++) {
		if (securityQuestions[i].answer !== answers[i]) {
			answersError = 'Incorrect answer/s'
			break
		}
	}
	
	if (answersError) {
		res.statusCode = 204
		res.statusMessage = answersError
		res.end()
	}
	
	return answersError
	
}



// Actions that the server will handle
const actions = {
	
	'forgot-password-submit-username': async function (req, res, log, headers, body) {
		
		const username = await getRequestBody(req);
		
		const { userError, securityQuestions } = fpCheckUser(username, res)
		if (userError) {
			return
		}
		
		const questions = securityQuestions.map(
			(securityQuestion) => securityQuestion.question
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(questions));
	
	},
	
	'forgot-password-submit-answer': async function (req, res, log, headers, body) {
		
		const requestBody = await getRequestBody(req);
		
		const { username, answers } = JSON.parse(requestBody)
		
		const { userError, securityQuestions } = fpCheckUser(username, res)
		if (userError) {
			return
		}
		
		const answersError = fpCheckAnswers(securityQuestions, answers, res)
		if (answersError) {
			return
		}
		
		res.statusCode = 200
		res.end();
	
	},
	
	'forgot-password-submit-new-password': async function (req, res, log, headers, body) {
		
		const requestBody = await getRequestBody(req);
		
		const { username, answers, newPassword } = JSON.parse(requestBody)
		
		const { userError, securityQuestions, user } = fpCheckUser(username, res)
		if (userError) {
			return
		}
		
		const answersError = fpCheckAnswers(securityQuestions, answers, res)
		if (answersError) {
			return
		}
		
		if (!newPassword) {
			res.statusCode = 204
			res.statusMessage = 'Password is required.'
			res.end()
			return
		}
		
		const changed = database.setUserPassword(user.id, newPassword)
		
		database.createUserAction(user.id, 'Changed password through Forgot Password')
		
		res.statusCode = 200
		res.end();
	
	},
	
}



module.exports = {
	actions
}