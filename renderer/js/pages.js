var currentPage

async function setPage(nextPage) {
	
	if (!nextPage) {
		nextPage = currentPage
	}
	
	if (nextPage === 'home') {
		nextPage = 'customer-management'
	}
	
	if (nextPage !== 'login') {
		if (currentUser.userType === 'admin') {
			mainDiv.innerHTML = htmlFiles['page-selector-admin.html']
		} else if (currentUser.userType === 'staff') {
			mainDiv.innerHTML = htmlFiles['page-selector-staff.html']
		} else {
			mainDiv.innerHTML = ""
		}
	}
	
	// Operations for when changing page from a certain page
	switch (currentPage) {
		
		case 'customer-management':
			cmClearData()
			break;
		
		case 'point-of-sales':
			posClearData()
			break;
		
	}
	
	currentPage = nextPage
	
	// Operations for when changing page to a certain page
	switch (nextPage) {
		
		case 'point-of-sales':
			if (currentUser.userType === 'admin') {
				mainDiv.innerHTML += htmlFiles['point-of-sales-admin.html']
				await posSetupSalesTable(true)
			} else if (currentUser.userType === 'staff') {
				mainDiv.innerHTML += htmlFiles['point-of-sales-staff.html']
				await posSetupSalesTable()
			}
			break;
		
		case 'customer-management':
			mainDiv.innerHTML += htmlFiles['customer-management.html']
			await cmSetupCustomerTable()
			break;
		
		case 'login':
			mainDiv.innerHTML = htmlFiles['login.html']
			break;
			
	}
	
	setSecondary()
	
}



async function addSecondary(secondary) {
	
	const div = document.createElement('div')
	
	switch (secondary) {
		
		case 'forgot-password-username':
			div.innerHTML = htmlFiles['forgot-password-username.html']
			break;
		
		case 'forgot-password-answer':
			div.innerHTML = htmlFiles['forgot-password-answer.html']
			break;
		
		case 'forgot-password-new-password':
			div.innerHTML = htmlFiles['forgot-password-new-password.html']
			break;
		
		case 'customer-registration':
			div.innerHTML = htmlFiles['customer-registration.html']
			break;
		
		case 'customer-search':
			div.innerHTML = htmlFiles['customer-search.html']
			break;
		
		case 'customer-edit':
			div.innerHTML = htmlFiles['customer-edit.html']
			break;
		
		case 'customer-services':
			div.innerHTML = htmlFiles['customer-services.html']
			break;
		
	}
	
	secondaryDiv.append(div)
	
	return div
	
}

async function setSecondary(secondary) {
	
	clearSecondary()
	
	if (secondary) {
		return addSecondary(secondary)
	}
	
}

async function clearSecondary() {
	
	while (secondaryDiv.lastChild) {
		secondaryDiv.lastChild.remove()
	}
	
}

async function removeSecondary(child) {
	
	if (child) {
		child.remove()
	} else if (secondaryDiv.lastChild) {
		secondaryDiv.lastChild.remove()
	}
	
}