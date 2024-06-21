var posSalesRecordTable
var posSalesRecordData
var posCustomerData
var posStaffData
var posServiceData
var posViewedSalesRecord



async function posSetupSalesRecordTable(selectable) {

	const salesRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-sales-records',
			token
		},
	);
	
	{
		const tokenError = await checkToken(salesRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(salesRequest)
		if (permissionError) { return; }
	}
	
	const customerRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-customer-names',
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
			action: 'point-of-sales-get-staff-names',
			token
		},
	);
	
	{
		const tokenError = await checkToken(staffRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(staffRequest)
		if (permissionError) { return; }
	}
	
	const serviceRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-services',
			token
		},
	);
	
	{
		const tokenError = await checkToken(serviceRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(serviceRequest)
		if (permissionError) { return; }
	}
	
	posSalesRecordData = JSON.parse(salesRequest.responseText)
	posCustomerData = JSON.parse(customerRequest.responseText)
	posStaffData = JSON.parse(staffRequest.responseText)
	posServiceData = JSON.parse(serviceRequest.responseText)
	
	posSalesRecordData.forEach(
		(record) => {
			
			record.formattedTotalPrice = record.totalPrice.toFixed(2)
			record.formattedPayment = record.payment.toFixed(2)
			record.formattedChange = record.change.toFixed(2)
			
			record.shortDate = (new Date(record.date)).toDateString()
			
			const customer = posCustomerData.find(
				(customer) => customer.id === record.customerID
			)
			
			if (customer) {
				record.customer = customer.id + ' - ' + customer.fullName
			}
			
			const servicingStaff = posStaffData.find(
				(staff) => staff.id === record.servicingStaffID
			)
			
			if (servicingStaff) {
				record.servicingStaff = servicingStaff.id + ' - ' + servicingStaff.fullName
			}
			
			record.services = () => {
				posViewedSalesRecord = record
				posViewServices()
			}
			
		}
	);
	
	const salesRecords = [...posSalesRecordData]
	salesRecords.sort(
		(a, b) => b.id - a.id
	)
	salesRecords.sort(
		(a, b) => Date.parse(b.date) - Date.parse(a.date)
	)
	
	if (posViewedSalesRecord) {
		posViewedSalesRecord = posSalesRecordData.find(
			(record) => record.id === posViewedSalesRecord.id
		)
	}
	
	if (posViewedSalesRecord) {
		await posViewServices()
	}
	
	if (posSalesRecordTable) {
		posSalesRecordTable.setData(salesRecords)
		return
	}
	
	const tableDiv = document.getElementById('sales-record-table')
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	posSalesRecordTable = createTable(
		tableDiv,
		{
			id: 'ID',
			customer: 'Customer',
			servicingStaff: 'Servicing Staff',
			shortDate: 'Date',
			services: 'Services'
		},
		salesRecords,
		{
			itemsPerPage: userIsAdmin ? 7 : 9,
			select: userIsAdmin
		}
	)
	
}

function serviceInputGenerator(action, updateTotalPrice) {
	return () => {
		const serviceInput = document.createElement('select')
		serviceInput.className = `sales-record-${action}-service`
		for (const service of posServiceData) {
			const option = document.createElement('option')
			option.value = service.id
			option.innerText = service.id + ' - ' + service.name
			serviceInput.append(option)
		}
		
		serviceInput.onchange = () => {
			const serviceID = serviceInput.value
			const tr = serviceInput.parentElement.parentElement
			const priceInput = tr.getElementsByClassName(`sales-record-${action}-service-price`)[0]
			
			priceInput.value = posServiceData.find(
				(service) => service.id == serviceID
			).defaultPrice.toFixed(2)
			
			updateTotalPrice()
		}
		
		serviceInput.value = posServiceData[0].id
		
		return serviceInput
	}
}

function priceInputGenerator(action, updateTotalPrice) {
	return () => {
		const priceInput = document.createElement('input')
		priceInput.type = 'number'
		priceInput.className = `sales-record-${action}-service-price`
		
		priceInput.onchange = () => {
			priceInput.value = Number(priceInput.value).toFixed(2)
			updateTotalPrice()
		}
		
		priceInput.value = posServiceData[0].defaultPrice.toFixed(2)
		
		return priceInput
	}
}

function posSetupSalesRecordInputs(action) {
	const dateInput = document.getElementById(`sales-record-${action}-date`)
	dateInput.value = new Date().toLocaleDateString('en-CA')
	
	const customerInput = document.getElementById(`sales-record-${action}-customer`)
	
	const nameList = document.createElement('datalist')
	nameList.id = `sales-record-${action}-customers`
	for (const customer of posCustomerData) {
		const option = document.createElement('option')
		option.value = customer.id + ' - ' + customer.fullName
		nameList.append(option)
	}
	customerInput.parentElement.append(nameList)
	
	const staffInput = document.getElementById(`sales-record-${action}-servicing-staff`)
	for (const staff of posStaffData) {
		const option = document.createElement('option')
		option.value = staff.id
		option.innerText = staff.id + ' - ' + staff.fullName
		staffInput.append(option)
	}
	staffInput.value = currentUser.id
}

function posSetupServicesTable(action, services) {
	
	const totalPriceInput = document.getElementById(`sales-record-${action}-total-price`)
	const paymentInput = document.getElementById(`sales-record-${action}-payment`)
	const changeInput = document.getElementById(`sales-record-${action}-change`)
	
	const tableDiv = document.getElementById(`sales-record-${action}-services-table`)
	
	paymentInput.onchange = () => {
		updateTotalPrice()
	}
	
	const tableObj = createEditTable(
		tableDiv,
		{
			'Service': serviceInputGenerator(action, updateTotalPrice),
			'Price': priceInputGenerator(action, updateTotalPrice)
		},
		{
			onchange: () => {
				updateTotalPrice()
			},
			name: 'Service'
		}
	)
	
	const tableContainers = tableDiv.getElementsByClassName('table-container')
	const oldTable = tableContainers[0]
	const newTable = tableContainers[1]
	const tFoot = oldTable.getElementsByTagName('tfoot')[0]
	
	newTable.firstChild.append(tFoot)
	oldTable.remove()
	
	if (services) {
		for (const service of services) {
			const tr = createEditTableRow(tableObj)
			
			const serviceInput = tr.getElementsByClassName(`sales-record-${action}-service`)[0]
			const priceInput = tr.getElementsByClassName(`sales-record-${action}-service-price`)[0]
			
			serviceInput.value = service.id
			priceInput.value = service.price.toFixed(2)
		}
	}
	
	updateTotalPrice()
	
	function updateTotalPrice() {
		const priceInputs = newTable.getElementsByClassName(`sales-record-${action}-service-price`)
		
		var totalPrice = 0
		
		for (const priceInput of priceInputs) {
			totalPrice += Number(priceInput.value)
		}
		
		totalPriceInput.value = totalPrice.toFixed(2)
		
		const payment = Number(paymentInput.value)
		paymentInput.value = payment.toFixed(2)
		changeInput.value = (payment - totalPrice).toFixed(2)
	}
	
}

function posCreateSalesRecord() {
	
	setSecondary('sales-record-creation')
	
	posSetupSalesRecordInputs('creation')
	
	const staffInput = document.getElementById('sales-record-creation-servicing-staff')
	if (currentUser.userType === 'admin') {
		staffInput.disabled = false
	}
	
	posSetupServicesTable('creation')
	
}

async function posSubmitCreation() {
	
	const customerInput = document.getElementById('sales-record-creation-customer')
	const paymentInput = document.getElementById('sales-record-creation-payment')
	const staffInput = document.getElementById('sales-record-creation-servicing-staff')
	
	const customerID = customerInput.value.split(' - ')[0]
	const payment = paymentInput.value
	const servicingStaffID = staffInput.value
	
	const services = []
	
	const serviceInputs = document.getElementsByClassName('sales-record-creation-service')
	const priceInputs = document.getElementsByClassName('sales-record-creation-service-price')
	
	for (var i = 0; i < serviceInputs.length; i++) {
		const serviceInput = serviceInputs[i]
		const priceInput = priceInputs[i]
		
		services.push({
			id: serviceInput.value,
			price: priceInput.value
		})
	}
	
	const createRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-create-sales-record',
			token
		},
		JSON.stringify({
			customerID,
			servicingStaffID,
			payment,
			services
		})
	);
	
	{
		const tokenError = await checkToken(createRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(createRequest)
		if (permissionError) { return; }
	}
	
	if (createRequest.status === 200) {
		createMessageDialogue('success', 'Record Creation Successful', createRequest.statusText)
		setPage('point-of-sales')
		return
	}
	
	createMessageDialogue('error', 'Record Creation Failed', createRequest.statusText)
	
}

function posCancelCreation() {
	clearSecondary()
}



async function posViewServices() {
	
	setSecondary('sales-record-services')
	
	salesRecordID = posViewedSalesRecord.id
	
	const {
		servicingStaffID,
		customerID,
		totalPrice,
		payment,
		change,
		date
	} = posViewedSalesRecord
	
	const recordIDDiv = document.getElementById('sales-record-services-id')
	const servicingStaffDiv = document.getElementById('sales-record-services-servicing-staff')
	const customerDiv = document.getElementById('sales-record-services-customer')
	const dateDiv = document.getElementById('sales-record-services-date')
	
	const servicingStaff = servicingStaffID + ' - ' + posStaffData.find(
		(staff) => staff.id == servicingStaffID
	).fullName
	
	const customer = customerID ? customerID + ' - ' + posCustomerData.find(
		(cust) => cust.id == customerID
	).fullName : '-'
	
	const formattedDate = (new Date(date)).toDateString()
	
	recordIDDiv.innerText = salesRecordID
	servicingStaffDiv.innerText = servicingStaff
	customerDiv.innerText = customer
	dateDiv.innerText = formattedDate
	
	const totalPriceTD = document.getElementById(`sales-record-services-total-price`)
	const paymentTD = document.getElementById(`sales-record-services-payment`)
	const changeInputTD = document.getElementById(`sales-record-services-change`)
	
	totalPriceTD.innerText = totalPrice.toFixed(2)
	paymentTD.innerText = payment.toFixed(2)
	changeInputTD.innerText = change.toFixed(2)
	
	
	const servicesRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-offered-services-by-sales-record-id',
			token
		},
		salesRecordID
	);
	
	{
		const tokenError = await checkToken(servicesRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(servicesRequest)
		if (permissionError) { return; }
	}
	
	if (servicesRequest.status !== 200) {
		createMessageDialogue('error', 'Viewing Sales Record Services Failed', recordRequest.statusText)
		return
	}
	
	const services = JSON.parse(servicesRequest.responseText)
	
	const tableDiv = document.getElementById(`sales-record-services-services-table`)
	
	var i = 0
	
	const tableObj = createEditTable(
		tableDiv,
		{
			'Service': () => {
				const serviceID = services[i].id
				const serviceName = posServiceData.find(
					(service) => service.id == serviceID
				).name
				const serviceDiv = document.createElement('div')
				serviceDiv.className = 'sales-record-services-service'
				serviceDiv.append(serviceID + ' - ' + serviceName)
				return serviceDiv
			},
			'Price': () => {
				const priceDiv = document.createElement('div')
				priceDiv.className = 'sales-record-services-service-price'
				priceDiv.append(services[i].price.toFixed(2))
				return priceDiv
			}
		},
		{
			editable: false
		}
	)
	
	for (const service of services) {
		createEditTableRow(tableObj)
		i++
	}
	
	
	
	const tableContainers = tableDiv.getElementsByClassName('table-container')
	const oldTable = tableContainers[0]
	const newTable = tableContainers[1]
	const tFoot = oldTable.getElementsByTagName('tfoot')[0]
	
	newTable.firstChild.append(tFoot)
	oldTable.remove()
	
	if (currentUser.userType === 'admin') {
		const columnDiv = document.getElementById('sales-record-services-column')
		
		const bottomDiv = document.createElement('div')
		bottomDiv.id = 'sales-record-services-bottom'
		
		const button = document.createElement('div')
		button.className = 'button'
		button.onclick = () => {
			posEditSalesRecord(posViewedSalesRecord)
		}
		
		const icon = document.createElement('div')
		icon.className = 'icon edit-icon'
		
		button.append(icon)
		button.append(' Edit Sales Record')
		bottomDiv.append(button)
		columnDiv.append(bottomDiv)
	}
	
}

function posCloseServices() {
	posViewedSalesRecord = undefined
	clearSecondary()
}



async function posEditSalesRecord(selectedRecord) {
	
	addSecondary('sales-record-edit')
	
	posSetupSalesRecordInputs('edit')
	
	posSetupServicesTable('edit')
	
	if (selectedRecord) {
		const salesRecordIDInput = document.getElementById('sales-record-edit-id')
		salesRecordIDInput.value = selectedRecord.id
		await posCheckID()
	}
	
}

async function posCheckID() {
	
	const salesRecordID = document.getElementById('sales-record-edit-id').value
	
	if (!salesRecordID) {
		createMessageDialogue('error', 'Sales Record ID Check Failed', 'The sales record ID is required.')
		return
	}
	
	const recordRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-sales-record-by-id',
			token
		},
		salesRecordID
	);
	
	{
		const tokenError = await checkToken(recordRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(recordRequest)
		if (permissionError) { return; }
	}
	
	if (recordRequest.status !== 200) {
		createMessageDialogue('error', 'Sales Record ID Check Failed', recordRequest.statusText)
		return
	}
	
	const servicesRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-offered-services-by-sales-record-id',
			token
		},
		salesRecordID
	);
	
	{
		const tokenError = await checkToken(servicesRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(servicesRequest)
		if (permissionError) { return; }
	}
	
	if (servicesRequest.status !== 200) {
		createMessageDialogue('error', 'Sales Record ID Check Failed', recordRequest.statusText)
		return
	}
	
	const salesRecord = JSON.parse(recordRequest.responseText)
	const services = JSON.parse(servicesRequest.responseText)
	
	const staffInput = document.getElementById('sales-record-edit-servicing-staff')
	const customerInput = document.getElementById('sales-record-edit-customer')
	const paymentInput = document.getElementById('sales-record-edit-payment')
	
	const customerID = salesRecord.customerID
	const customer = customerID ? customerID + ' - ' + posCustomerData.find(
		(customer) => customer.id == customerID
	).fullName : ''
	
	staffInput.value = salesRecord.servicingStaffID
	customerInput.value = customer
	paymentInput.value = salesRecord.payment
	
	posSetupServicesTable('edit', services)
	
	return
	
}

function posCancelEdit () {
	removeSecondary()
}

async function posSubmitEdit() {
	
	const salesRecordIDInput = document.getElementById('sales-record-edit-id')
	const customerInput = document.getElementById('sales-record-edit-customer')
	const paymentInput = document.getElementById('sales-record-edit-payment')
	const staffInput = document.getElementById('sales-record-edit-servicing-staff')
	
	const salesRecordID = salesRecordIDInput.value
	const customerID = customerInput.value.split(' - ')[0]
	const payment = paymentInput.value
	const servicingStaffID = staffInput.value
	
	const services = []
	
	const serviceInputs = document.getElementsByClassName('sales-record-edit-service')
	const priceInputs = document.getElementsByClassName('sales-record-edit-service-price')
	
	for (var i = 0; i < serviceInputs.length; i++) {
		const serviceInput = serviceInputs[i]
		const priceInput = priceInputs[i]
		
		services.push({
			id: serviceInput.value,
			price: priceInput.value
		})
	}
	
	const createRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-edit-sales-record',
			token
		},
		JSON.stringify({
			salesRecordID,
			customerID,
			servicingStaffID,
			payment,
			services
		})
	);
	
	{
		const tokenError = await checkToken(createRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(createRequest)
		if (permissionError) { return; }
	}
	
	if (createRequest.status === 200) {
		createMessageDialogue('success', 'Record Creation Successful', createRequest.statusText)
		await posSetupSalesRecordTable()
		removeSecondary()
		return
	}
	
	createMessageDialogue('error', 'Record Creation Failed', createRequest.statusText)
}

function posClearData() {
	posSalesRecordData = undefined
	posCustomerData = undefined
	posStaffData = undefined
	posSalesRecordTable = undefined
	posServiceData = undefined
}