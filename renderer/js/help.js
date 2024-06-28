function hOpenFAQ() {
	setSecondary('help-faq')
	
	const faqDiv = document.getElementById('faq-div')
	const faqQuestions = document.getElementsByClassName('faq-question')
	var i = 0
	
	for (const faqQuestion of faqQuestions) {
		const checkboxID = 'faq-checkbox-' + i
		
		const checkbox = document.createElement('input')
		checkbox.type = 'checkbox'
		checkbox.className = 'faq-checkbox'
		checkbox.id = checkboxID
		
		faqQuestion.htmlFor = checkboxID
		
		const icon = document.createElement('div')
		icon.className = 'icon arrow-right-icon'
		
		faqQuestion.append(icon)
		faqDiv.insertBefore(checkbox, faqQuestion)
		i++
	}
}

function hOpenUserManual(defaultSection) {
	setSecondary('help-user-manual')
	
	const listTBody = document.getElementById('user-manual-content-list-tbody')
	
	var maxLevel = 0
	var itemI = 0

	for (const section in userManualSections) {
		const level = userManualSections[section].level
		if (level > maxLevel) {
			maxLevel = level
		}
	}
	
	for (const section in userManualSections) {
		const sectionData = userManualSections[section]
		const { level, html } = sectionData
		const [ number, title ] = section.split(' - ')
		const itemID = 'user-manual-content-list-item-' + itemI
		sectionData.itemID = itemID
		
		const itemTR = document.createElement('tr')
		itemTR.id = itemID
		itemTR.className = 'user-manual-content-list-item'
		
		var numberTD
		for (var i = 0; i <= level; i++) {
			numberTD = document.createElement('td')
			itemTR.append(numberTD)
		}
		numberTD.className = 'user-manual-content-list-number'
		numberTD.innerText = number
		
		const titleTD = document.createElement('td')
		titleTD.className = 'user-manual-content-list-title'
		titleTD.innerText = title
		titleTD.colSpan = maxLevel - level + 1
		
		itemTR.append(titleTD)
		listTBody.append(itemTR)

		if (html) {
			itemTR.className += ' clickable'
			itemTR.onclick = () => {hSetUserManualSection(section)}
		}
		
		itemI++
	}
	
	if (defaultSection) {
		hSetUserManualSection(defaultSection)
	}
}

function hSetUserManualSection(section) {
	const sectionData = userManualSections[section]
	if (sectionData && sectionData.html) {
		document.getElementById('user-manual-content').innerHTML = sectionData.html
		
		const itemDivs = document.getElementsByClassName('user-manual-content-list-item')
		for (const itemDiv of itemDivs) {
			itemDiv.className = itemDiv.className.replace(/ ?selected/, '')
		}
		
		document.getElementById(sectionData.itemID).className += ' selected'
	}
}