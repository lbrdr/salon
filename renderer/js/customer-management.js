var cmSelectedCustomer
var cmStaffData
var cmCustomerData
var cmCustomerTable
var cmSearchTable

async function cmSetupCustomerTable() {
	
	const customerRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-get-customers',
			token
		},
	);
	
	{
		const tokenError = await checkToken(customerRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(customerRequest)
		if (permissionError) { return; }
	}
	
	const staffRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-get-staff-names',
			token
		},
	);
	
	{
		const tokenError = await checkToken(staffRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(staffRequest)
		if (permissionError) { return; }
	}
	
	
	
	cmCustomerData = JSON.parse(customerRequest.responseText)
	cmStaffData = JSON.parse(staffRequest.responseText)
	
	cmCustomerData.forEach((customer) => {
		
		customer.shortDateRegistered = (new Date(customer.dateRegistered)).toDateString()
		
		const preferredStaff = cmStaffData.find(
			(staff) => staff.id === customer.preferredStaffID
		)
		
		if (preferredStaff) {
			customer.preferredStaff = preferredStaff.id + ' - ' + preferredStaff.fullName
		}
		
		customer.services = () => {
			cmCustomerServices(customer)
		}
		
	});
	
	const relevantCustomers = [...cmCustomerData]
	relevantCustomers.sort(
		(a, b) => b.id - a.id
	)
	relevantCustomers.sort(
		(a, b) => Date.parse(b.dateRegistered) - Date.parse(a.dateRegistered)
	)
	
	if (cmCustomerTable) {
		cmCustomerTable.setData(relevantCustomers)
		return
	}
	
	const tableDiv = document.getElementById('customer-table')
	
	cmCustomerTable = createTable(
		tableDiv,
		{
			id: 'ID',
			fullName: 'Full Name',
			contact: 'Contact',
			preferredStaff: 'Preferred Staff',
			shortDateRegistered: 'Date Registered',
			services: 'Services'
		},
		relevantCustomers,
		{
			itemsPerPage: 7,
			select: true
		}
	)
	
}



function cmRegisterCustomer() {
	setSecondary('customer-registration')
	
	const dateInput = document.getElementById('customer-registration-date')
	dateInput.value = new Date().toLocaleDateString('en-CA')
	
	const nameInput = document.getElementById('customer-registration-full-name')
	
	const nameList = document.createElement('datalist')
	nameList.id = 'customer-names'
	for (const customer of cmCustomerData) {
		const option = document.createElement('option')
		option.value = customer.fullName
		option.innerText = customer.fullName
		nameList.append(option)
	}
	nameInput.parentElement.append(nameList)
	
	const staffInput = document.getElementById('customer-registration-preferred-staff')
	{
		const option = document.createElement('option')
		option.value = ''
		option.innerText = 'None'
		staffInput.append(option)
	}
	for (const staff of cmStaffData) {
		const option = document.createElement('option')
		option.value = staff.id
		option.innerText = staff.id + ' - ' + staff.fullName
		staffInput.append(option)
	}
}

function cmCancelRegistration() {
	clearSecondary()
}

async function cmSubmitRegistration() {
	const fullName = document.getElementById('customer-registration-full-name').value
	const contact = document.getElementById('customer-registration-contact').value
	const preferredStaffID = document.getElementById('customer-registration-preferred-staff').value
	
	if (!fullName) {
		createMessageDialogue('error', 'Customer Registration Failed', 'The full name of the customer is required.')
		return
	}
	
	const registerRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-register-customer',
			token
		},
		JSON.stringify({
			fullName,
			contact,
			preferredStaffID
		})
	);
	
	{
		const tokenError = await checkToken(registerRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(registerRequest)
		if (permissionError) { return; }
	}
	
	if (registerRequest.status === 200) {
		createMessageDialogue('success', 'Customer Registration Successful', 'The user has been successfully registered')
		setPage('customer-management')
		return
	}
	
	createMessageDialogue('error', 'Customer Registration Failed', registerRequest.statusText)
	
}



function cmCustomerSearch() {
	setSecondary('customer-search')
	
	const staffInput = document.getElementById('customer-search-preferred-staff')
	
	{
		const option = document.createElement('option')
		option.value = ''
		option.innerText = 'Any'
		staffInput.append(option)
	}
	{
		const option = document.createElement('option')
		option.value = 0
		option.innerText = 'None'
		staffInput.append(option)
	}
	for (const staff of cmStaffData) {
		const option = document.createElement('option')
		option.value = staff.id
		option.innerText = staff.id + ' - ' + staff.fullName
		staffInput.append(option)
	}
	staffInput.value = ''
	// staffInput.value = currentUser.id
	
	const tableDiv = document.getElementById('customer-search-table')
	
	cmSearchTable = createTable(
		tableDiv,
		{
			id: 'ID',
			fullName: 'Full Name',
			contact: 'Contact',
			preferredStaff: 'Preferred Staff',
			shortDateRegistered: 'Date Registered',
			shortLastService: 'Date Of Last Service',
			services: 'Services'
		},
		[],
		{
			minRows: 6,
			select: true
		}
	)
	
	cmSubmitSearch()
}

async function cmSubmitSearch() {
	const customerID = document.getElementById('customer-search-id').value
	const fullName = document.getElementById('customer-search-full-name').value
	const contact = document.getElementById('customer-search-contact').value
	const preferredStaffID = document.getElementById('customer-search-preferred-staff').value
	const dateRegisteredFrom = document.getElementById('customer-search-date-registered-from').value
	const dateRegisteredTo = document.getElementById('customer-search-date-registered-to').value
	const lastServiceFrom = document.getElementById('customer-search-last-service-from').value
	const lastServiceTo = document.getElementById('customer-search-last-service-to').value
	
	const searchRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-get-customers-by-search',
			token
		},
		JSON.stringify({
			id: customerID,
			fullName,
			contact,
			preferredStaffID,
			dateRegisteredFrom,
			dateRegisteredTo,
			lastServiceFrom,
			lastServiceTo
		})
	);
	
	{
		const tokenError = await checkToken(searchRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(searchRequest)
		if (permissionError) { return; }
	}
	
	const searchedCustomers = JSON.parse(searchRequest.responseText)
	
	searchedCustomers.forEach((customer) => {
		
		customer.shortDateRegistered = (new Date(customer.dateRegistered)).toDateString()
		if (customer.lastService) {
			customer.shortLastService = (new Date(customer.lastService)).toDateString()
		}
		
		const preferredStaff = cmStaffData.find(
			(staff) => staff.id === customer.preferredStaffID
		)
		
		if (preferredStaff) {
			customer.preferredStaff = preferredStaff.id + ' - ' + preferredStaff.fullName
		}
		
		customer.services = () => {
			cmCustomerServices(customer)
		}
		
	});
	
	cmSearchTable.setData(searchedCustomers)
}

function cmCloseSearch() {
	cmSearchTable = undefined
	clearSecondary()
}



function cmEditSearchedCustomer() {
	const customer = cmSearchTable.selected
	
	cmCustomerEdit(customer)
}

function cmEditCustomer() {
	const customer = cmCustomerTable.selected
	
	cmCustomerEdit(customer)
}

async function cmCustomerEdit(customer) {
	addSecondary('customer-edit')
	
	if (!customer) {
		return
	}
	
	document.getElementById('customer-edit-id').value = customer.id
	
	const staffInput = document.getElementById('customer-edit-preferred-staff')
	{
		const option = document.createElement('option')
		option.value = ''
		option.innerText = 'None'
		staffInput.append(option)
	}
	for (const staff of cmStaffData) {
		const option = document.createElement('option')
		option.value = staff.id
		option.innerText = staff.id + ' - ' + staff.fullName
		staffInput.append(option)
	}
	
	await cmCheckID()
}

async function cmCheckID() {
	
	const customerID = document.getElementById('customer-edit-id').value
	
	if (!customerID) {
		createMessageDialogue('error', 'Customer ID Check Failed', 'The customer ID is required.')
		return
	}
	
	const customerRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-get-customer-by-id',
			token
		},
		customerID
	);
	
	{
		const tokenError = await checkToken(customerRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(customerRequest)
		if (permissionError) { return; }
	}
	
	if (customerRequest.status === 200) {
		const customer = JSON.parse(customerRequest.responseText)
		
		const fullNameInput = document.getElementById('customer-edit-full-name')
		const contactInput = document.getElementById('customer-edit-contact')
		const staffInput = document.getElementById('customer-edit-preferred-staff')
		
		fullNameInput.value = customer.fullName
		contactInput.value = customer.contact
		staffInput.value = customer.preferredStaffID
		
		return
	}
	
	createMessageDialogue('error', 'Customer ID Check Failed', customerRequest.statusText)
	
	
}

function cmCancelEdit() {
	removeSecondary()
}

async function cmSubmitEdit() {
	
	const customerID = document.getElementById('customer-edit-id').value
	const fullName = document.getElementById('customer-edit-full-name').value
	const contact = document.getElementById('customer-edit-contact').value
	const preferredStaffID = document.getElementById('customer-edit-preferred-staff').value
	
	if (!customerID) {
		createMessageDialogue('error', 'Customer Edit Failed', 'The customer ID is required.')
		return
	}
	
	if (!fullName) {
		createMessageDialogue('error', 'Customer Edit Failed', 'The full name of the customer is required.')
		return
	}
	
	const editRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-edit-customer',
			token
		},
		JSON.stringify({
			id: customerID,
			fullName,
			contact,
			preferredStaffID
		})
	);
	
	{
		const tokenError = await checkToken(editRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(editRequest)
		if (permissionError) { return; }
	}
	
	if (editRequest.status === 200) {
		createMessageDialogue('success', 'Customer Edit Successful', 'The user has been successfully edited')
		removeSecondary()
		cmSetupCustomerTable()
		if (cmSearchTable) {
			cmSubmitSearch()
		}
		return
	}
	
	createMessageDialogue('error', 'Customer Edit Failed', editRequest.statusText)
	
}



async function cmCustomerServices(customer) {
	
	const customerID = customer.id
	
	const servicesRequest = await queryRequest(
		'POST',
		{
			action: 'customer-management-get-customer-services',
			token
		},
		customerID
	);
	
	{
		const tokenError = await checkToken(servicesRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(servicesRequest)
		if (permissionError) { return; }
	}
	
	if (servicesRequest.status === 200) {
	
		const customerServices = JSON.parse(servicesRequest.responseText)
		
		customerServices.forEach(
			(service) => {
				
				service.shortDate = (new Date(service.date)).toDateString()
				
				const servicingStaff = cmStaffData.find(
					(staff) => staff.id === service.servicingStaffID
				)
				
				service.servicingStaff = servicingStaff.id + ' - ' + servicingStaff.fullName				
				
			}
		)
		
		addSecondary('customer-services')
		
		const fullNameDiv = document.getElementById('customer-services-full-name')
		fullNameDiv.innerText = customer.id + ' - ' + customer.fullName
		
		const tableDiv = document.getElementById('customer-services-table')
		
		const offeredServices = [...customerServices]
		
		offeredServices.sort(
			(a, b) => b.id - a.id
		)
		offeredServices.sort(
			(a, b) => Date.parse(b.date) - Date.parse(a.date)
		)
		
		createTable(
			tableDiv,
			{
				servicingStaff: 'Servicing Staff',
				name: 'Service Name',
				shortDate: 'Date Offered'
			},
			offeredServices,
			{
				minRows: 5
			}
		)
		
		return
		
	}
	
	createMessageDialogue('error', 'Viewing Customer Services Failed', servicesRequest.statusText)
	
}

function cmCloseServices() {
	removeSecondary()
}



function cmClearData() {
	cmSearchTable = undefined
	
	cmSelectedCustomer = undefined
	cmCustomerTable = undefined
	
	cmStaffData = undefined
	cmCustomerData = undefined
}