var fpUsername
var fpAnswers

async function forgotPassword() {
	setSecondary('forgot-password-username')
}

async function fpSubmitUsername() {
	
	fpUsername = document.getElementById('forgot-password-username').value
	
	const request = await queryRequest(
		'POST',
		{action: 'forgot-password-submit-username'},
		fpUsername
	);
	
	if (request.status === 200) {
		
		const fpQuestions = JSON.parse(request.responseText)
		
		setSecondary('forgot-password-answer')
		
		const usernameInput = document.getElementById('forgot-password-username')
		usernameInput.value = fpUsername
			
		const fpDiv = document.getElementById('forgot-password-div')
		
		for (var i = 0; i < fpQuestions.length; i++) {
			const question = fpQuestions[i]
			
			const rowDiv = document.createElement('div')
			rowDiv.className = 'forgot-password-row'
			
			const answerID = 'forgot-password-answer' + i
			
			const icon = document.createElement('label')
			icon.htmlFor = answerID
			icon.className = 'icon forgot-password-question-icon'
			
			const columnDiv = document.createElement('div')
			
			const questionTitle = document.createElement('label')
			questionTitle.htmlFor = answerID
			questionTitle.className = 'forgot-password-title'
			questionTitle.innerText = 'Security Question ' + (i+1)
			
			const questionLabel = document.createElement('label')
			questionLabel.htmlFor = answerID
			questionLabel.className = 'forgot-password-label'
			questionLabel.innerText = question
			
			const questionAnswer = document.createElement('input')
			questionAnswer.type = 'text'
			questionAnswer.id = answerID
			
			columnDiv.append(questionTitle)
			columnDiv.append(questionLabel)
			columnDiv.append(questionAnswer)
			rowDiv.append(icon)
			rowDiv.append(columnDiv)
			fpDiv.append(rowDiv)
		}
	
		fpAnswers = new Array(fpQuestions.length)
		
		return
		
	}
	
	if (request.status === 204) {
		createMessageDialogue('error', 'Username Submission Failed', request.statusText)
		return
	}
	
	createMessageDialogue('error', 'Username Submission Failed', 'Server-side Error')
	
}



async function fpSubmitAnswer() {
	
	for(var i = 0; i < fpAnswers.length; i++) {
		fpAnswers[i] = document.getElementById('forgot-password-answer' + i).value
	}
	
	const request = await queryRequest(
		'POST',
		{action: 'forgot-password-submit-answer'},
		JSON.stringify({
			username: fpUsername,
			answers: fpAnswers
		}),
	);
	
	
	if (request.status === 200) {
		setSecondary('forgot-password-new-password')
		return
	}
	
	if (request.status === 204) {
		createMessageDialogue('error', 'Answer Submission Failed', request.statusText)
		return
	}
	
	createMessageDialogue('error', 'Answer Submission Failed', 'Server-side Error')
	
}



async function fpSubmitNewPassword() {
	
	const newPassword = document.getElementById('forgot-password-new-password').value
	const confirmPassword = document.getElementById('forgot-password-confirm-password').value
	
	if (!newPassword) {
		createMessageDialogue('error', 'Password Submission Failed', 'No password')
		return
	}
	
	if (newPassword !== confirmPassword) {
		createMessageDialogue('error', 'Password Submission Failed', 'Confirm password doesn\'t match.')
		return
	}
	
	const request = await queryRequest(
		'POST',
		{action: 'forgot-password-submit-new-password'},
		JSON.stringify({
			username: fpUsername,
			answers: fpAnswers,
			newPassword
		}),
	);
	
	
	if (request.status === 200) {
		clearSecondary()
		createMessageDialogue('success', 'Password Reset Successful', 'New password has been set.')
		return
	}
	
	if (request.status === 204) {
		createMessageDialogue('error', 'Password Submission Failed', request.statusText)
		return
	}
	
	createMessageDialogue('error', 'Password Submission Failed', 'Server-side Error')
	
}



function fpCancel() {
	fpUsername = undefined
	fpAnswers = undefined
	clearSecondary()
}