function hOpenFAQ() {
	setSecondary('help-faq')
	
	const faqDiv = document.getElementById('faq-div')
	
	var i = 0
	
	for (const faqItem of faqData) {
		const checkboxID = 'faq-checkbox-' + i
		
		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.className = 'faq-checkbox'
		checkbox.id = checkboxID
		
		const question = document.createElement('label')
		question.className = 'faq-question'
		question.htmlFor = checkboxID
		question.innerText = faqItem[0]
		
		const icon = document.createElement('div')
		icon.className = 'icon right-arrow-icon'
		
		const answer = document.createElement('div')
		answer.className = 'faq-answer'
		answer.innerText = faqItem[1]
		
		question.append(icon)
		faqDiv.append(checkbox)
		faqDiv.append(question)
		faqDiv.append(answer)
		i++
	}
}

function hOpenUserManuel() {
	setSecondary('help-user-manual')
}