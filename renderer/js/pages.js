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
		
		case 'inventory-management':
			imClearData()
			break;
		
		case 'user-management':
			umClearData()
			break;
		
	}
	
	currentPage = nextPage
	
	// Operations for when changing page to a certain page
	switch (nextPage) {
		
		case 'help':
			mainDiv.innerHTML += htmlFiles['help.html']
			break;
		
		case 'about':
			mainDiv.innerHTML += htmlFiles['about.html']
			break;
		
		case 'backup-and-restore':
			mainDiv.innerHTML += htmlFiles['backup-and-restore.html']
			break;
		
		case 'report':
			mainDiv.innerHTML += htmlFiles['report.html']
			rSetupInputs()
			break;
		
		case 'user-management':
			mainDiv.innerHTML += htmlFiles['user-management.html']
			await umSetupUserTable()
			break;
		
		case 'inventory-management':
			// mainDiv.innerHTML += htmlFiles['inventory-management.html']
			if (currentUser.userType === 'admin') {
				mainDiv.innerHTML += htmlFiles['inventory-management-admin.html']
			} else if (currentUser.userType === 'staff') {
				mainDiv.innerHTML += htmlFiles['inventory-management-staff.html']
			}
			await imSetupInventoryManagementTable(true)
			break;
		
		case 'point-of-sales':
			if (currentUser.userType === 'admin') {
				mainDiv.innerHTML += htmlFiles['point-of-sales-admin.html']
			} else if (currentUser.userType === 'staff') {
				mainDiv.innerHTML += htmlFiles['point-of-sales-staff.html']
			}
			await posSetupSalesRecordTable()
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
	
	setSystemTime()
	
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
		
		case 'sales-record-creation':
			div.innerHTML = htmlFiles['sales-record-creation.html']
			break;
		
		case 'sales-record-edit':
			div.innerHTML = htmlFiles['sales-record-edit.html']
			break;
		
		case 'sales-record-services':
			div.innerHTML = htmlFiles['sales-record-services.html']
			break;
		
		case 'inventory-item-records':
			div.innerHTML = htmlFiles['inventory-item-records.html']
			break;
		
		case 'inventory-record-creation':
			div.innerHTML = htmlFiles['inventory-record-creation.html']
			break;
		
		case 'inventory-record-edit':
			div.innerHTML = htmlFiles['inventory-record-edit.html']
			break;
		
		case 'inventory-stock-changes':
			div.innerHTML = htmlFiles['inventory-stock-changes.html']
			break;
		
		case 'user-registration':
			div.innerHTML = htmlFiles['user-registration.html']
			break;
		
		case 'user-edit':
			div.innerHTML = htmlFiles['user-edit.html']
			break;
		
		case 'services-edit':
			div.innerHTML = htmlFiles['services-edit.html']
			break;
		
		case 'help-faq':
			div.innerHTML = htmlFiles['help-faq.html']
			break;
		
		case 'help-user-manual':
			div.innerHTML = htmlFiles['help-user-manual.html']
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