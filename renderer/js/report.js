var rFrame
var rUserInputField
var rExpensesInputField


function rCreateReportFrame() {
	if (rFrame) {
		rFrame.remove()
	}
	
	const reportPreview = document.getElementById('report-preview')
	
	rFrame = document.createElement('iframe')
	rFrame.className = 'report-frame'
	
	reportPreview.append(rFrame)
	
	const frameDocument = rFrame.contentDocument
	frameDocument.body.innerHTML = htmlFiles['report-template.html']
	
	const cssLink = document.createElement("link");
	cssLink.href = "css/report-template.css"; 
	cssLink.rel = "stylesheet"; 
	cssLink.type = "text/css"; 
	frameDocument.head.appendChild(cssLink);
	
	return frameDocument
}

function rSetText(htmlID, text) {
	const frameDocument = rFrame.contentDocument
	frameDocument.getElementById(htmlID).innerText = text
}

function rFormatInputDate(inputDate) {
	return (new Date(inputDate + ' ')).toLocaleDateString()
}

function rFormatDate(date) {
	return (new Date(date)).toLocaleDateString()
}

function rFormatDateAndTime(date) {
	return (new Date(date)).toLocaleString()
}

async function rSetupInputs() {
	const today = new Date()
	
	const oneMonthAgo = new Date(today)
	oneMonthAgo.setMonth(today.getMonth() - 1)
	
	const startDateInput = document.getElementById('report-start-date')
	const endDateInput = document.getElementById('report-end-date')
	
	startDateInput.value = oneMonthAgo.toLocaleDateString('en-CA')
	endDateInput.value = today.toLocaleDateString('en-CA')
}

async function rSetupTempInputs() {
	
	const reportType = document.getElementById('report-type').value
	
	if (reportType === 'sales') {
		if (!rExpensesInputField) {
			rExpensesInputField = document.createElement('div')
			rExpensesInputField.className = 'report-field'
				
			const label = document.createElement('label')
			label.innerText = 'Total Expenses'
			label.htmlFor = 'report-expenses'
			
			const input = document.createElement('input')
			input.type = 'number'
			input.id = 'report-expenses'
			input.value = '0.00'
			input.onchange = () => {
				input.value = Number(input.value).toFixed(2)
			}
			
			rExpensesInputField.append(label)
			rExpensesInputField.append(input)
			document.getElementById('report-fields').append(rExpensesInputField)
		}
	} else {
		if (rExpensesInputField) {
			rExpensesInputField.remove()
			rExpensesInputField = undefined
		}
	}
	
	if (reportType === 'user') {		
		if (!rUserInputField) {
			
			const userRequest = await queryRequest(
				'POST',
				{
					action: 'report-get-users',
					token
				}
			);
			
			{
				const tokenError = await checkToken(userRequest)
				if (tokenError) { return tokenError; }
				const permissionError = checkPermission(userRequest)
				if (permissionError) { return permissionError; }
			}
			
			const users = JSON.parse(userRequest.responseText)
			
			rUserInputField = document.createElement('div')
			rUserInputField.className = 'report-field'
		
			const label = document.createElement('label')
			label.innerText = 'User'
			label.htmlFor = 'report-user'
			
			const select = document.createElement('select')
			select.id = 'report-user'
		
			{
				const option = document.createElement('option')
				option.id = 'report-user-'
				option.value = ''
				option.innerText = 'All Users'
				select.append(option)
			}
			
			for (const user of users) {
				const option = document.createElement('option')
				option.id = 'report-user-' + user.id
				option.value = user.id
				option.innerText = user.id + ' - ' + user.fullName + ' - ' + user.username
				select.append(option)
			}
			
			rUserInputField.append(label)
			rUserInputField.append(select)
			document.getElementById('report-fields').append(rUserInputField)
			
		}
	} else {
		if (rUserInputField) {
			rUserInputField.remove()
			rUserInputField = undefined
		}
	}
	
}



async function rGenerateReport() {
	const reportType = document.getElementById('report-type').value
	
	if (reportType === 'customer') {
		await rGenerateCustomerReport()
	}
	if (reportType === 'sales') {
		await rGenerateSalesReport()
	}
	if (reportType === 'inventory') {
		await rGenerateInventoryReport()
	}
	if (reportType === 'user') {
		await rGenerateUserReport()
	}
}



async function rGenerateCustomerReport() {
	
	const startDate = document.getElementById('report-start-date').value
	const endDate = document.getElementById('report-end-date').value
	
	const reportRequest = await queryRequest(
		'POST',
		{
			action: 'report-generate-customer-report',
			token
		},
		JSON.stringify({
			startDate: startDate && formatDate(startDate),
			endDate: endDate && formatDate(endDate, setToNextDay)
		})
	);
	
	{
		const tokenError = await checkToken(reportRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(reportRequest)
		if (permissionError) { return permissionError; }
	}
	
	report = JSON.parse(reportRequest.responseText)
	
	const {
		summary,
		newlyRegisteredCustomers,
		returningCustomers
	} = report
	
	const frameDocument = rCreateReportFrame()
	frameDocument.body.innerHTML += htmlFiles['report-template-customer.html']
	
	rSetText('date-generated', (new Date()).toString())
	rSetText('start-date',
		startDate ?
			rFormatInputDate(startDate) :
			'[Indefinite]'
	)
	rSetText('end-date',
		endDate ?
			rFormatInputDate(endDate) :
			rFormatInputDate(new Date())
	)
	
	for (const customer of newlyRegisteredCustomers) {
		customer.shortDateRegistered = rFormatDate(customer.dateRegistered)
	}
	for (const customer of returningCustomers) {
		customer.shortDateRegistered = rFormatDate(customer.dateRegistered)
	}
	
	createTable(
		frameDocument.getElementById('summary'),
		{
			classification: 'Classification',
			customers: '# of Customers',
			records: '# of Visits/Sales Records',
			services: '# of Availed Services'
		},
		summary,
		{
			minRows: 1
		}
	)
	
	createTable(
		frameDocument.getElementById('newly-registered-customers'),
		{
			id: 'ID',
			fullName: 'Full Name',
			contact: 'Contact',
			preferredStaff: 'Preferred Staff',
			shortDateRegistered: 'Date Registered'
		},
		newlyRegisteredCustomers,
		{
			minRows: 1
		}
	)
	
	createTable(
		frameDocument.getElementById('returning-customers'),
		{
			id: 'ID',
			fullName: 'Full Name',
			contact: 'Contact',
			preferredStaff: 'Preferred Staff',
			shortDateRegistered: 'Date Registered'
		},
		returningCustomers,
		{
			minRows: 1
		}
	)
	
	
}

async function rGenerateSalesReport() {
	
	const startDate = document.getElementById('report-start-date').value
	const endDate = document.getElementById('report-end-date').value
	const expenses = Number(document.getElementById('report-expenses').value)
	
	const reportRequest = await queryRequest(
		'POST',
		{
			action: 'report-generate-sales-report',
			token
		},
		JSON.stringify({
			startDate: startDate && formatDate(startDate),
			endDate: endDate && formatDate(endDate, setToNextDay),
			expenses
		})
	);
	
	{
		const tokenError = await checkToken(reportRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(reportRequest)
		if (permissionError) { return permissionError; }
	}
	
	report = JSON.parse(reportRequest.responseText)
	
	const {
		summary,
		salesRecords
	} = report
	
	const frameDocument = rCreateReportFrame()
	frameDocument.body.innerHTML += htmlFiles['report-template-sales.html']
	
	rSetText('date-generated', (new Date()).toString())
	rSetText('start-date',
		startDate ?
			rFormatInputDate(startDate) :
			'[Indefinite]'
	)
	rSetText('end-date',
		endDate ?
			rFormatInputDate(endDate) :
			rFormatInputDate(new Date())
	)
	
	for (const record of salesRecords) {
		record.shortDate = rFormatDate(record.date)
		record.totalPrice = record.totalPrice.toFixed(2)
		record.payment = record.payment.toFixed(2)
		record.change = record.change.toFixed(2)
	}
	
	createTable(
		frameDocument.getElementById('summary'),
		{
			grossIncome: 'Gross Income',
			expenses: 'Total Expenses',
			netIncome: 'Net Income'
		},
		[{
			grossIncome: summary.grossIncome.toFixed(2),
			expenses: summary.expenses.toFixed(2),
			netIncome: summary.netIncome.toFixed(2)
		}],
		{
			minRows: 1
		}
	)
	
	createTable(
		frameDocument.getElementById('sales-records'),
		{
			id: 'ID',
			customer: 'Customer',
			servicingStaff: 'Servicing Staff',
			shortDate: 'Date',
			totalPrice: 'Total Price',
			payment: 'Payment',
			change: 'Change'
		},
		salesRecords,
		{
			minRows: 1
		}
	)
	
}

async function rGenerateInventoryReport() {
	
	const startDate = document.getElementById('report-start-date').value
	const endDate = document.getElementById('report-end-date').value
	
	const reportRequest = await queryRequest(
		'POST',
		{
			action: 'report-generate-inventory-report',
			token
		},
		JSON.stringify({
			startDate: startDate && formatDate(startDate),
			endDate: endDate && formatDate(endDate, setToNextDay)
		})
	);
	
	{
		const tokenError = await checkToken(reportRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(reportRequest)
		if (permissionError) { return permissionError; }
	}
	
	report = JSON.parse(reportRequest.responseText)
	
	const {
		inventoryItems,
		inventoryRecords
	} = report
	
	const frameDocument = rCreateReportFrame()
	frameDocument.body.innerHTML += htmlFiles['report-template-inventory.html']
	
	rSetText('date-generated', (new Date()).toString())
	rSetText('start-date',
		startDate ?
			rFormatInputDate(startDate) :
			'[Indefinite]'
	)
	rSetText('end-date',
		endDate ?
			rFormatInputDate(endDate) :
			rFormatInputDate(new Date())
	)
	
	for (const record of inventoryRecords) {
		record.shortDate = rFormatDate(record.date)
	}
	
	createTable(
		frameDocument.getElementById('inventory-items'),
		{
			name: 'Name',
			manufacturer: 'Manufacturer',
			startStock: 'Start Stock',
			stockChanges: 'Stock Changes',
			endStock: 'End Stock',
			unit: 'Unit'
		},
		inventoryItems,
		{
			minRows: 1
		}
	)
	
	createTable(
		frameDocument.getElementById('inventory-records'),
		{
			id: 'ID',
			itemName: 'Item Name',
			itemManufacturer: 'Item Manufacturer',
			amount: 'Amount',
			itemUnit: 'Unit',
			recordingStaff: 'Recording Staff',
			shortDate: 'Date Recorded'
		},
		inventoryRecords,
		{
			minRows: 1
		}
	)
	
}

async function rGenerateUserReport() {
	
	const startDate = document.getElementById('report-start-date').value
	const endDate = document.getElementById('report-end-date').value
	const userID = document.getElementById('report-user').value
	const user = document.getElementById('report-user-' + userID).innerText
	
	const reportRequest = await queryRequest(
		'POST',
		{
			action: 'report-generate-user-report',
			token
		},
		JSON.stringify({
			startDate: startDate && formatDate(startDate),
			endDate: endDate && formatDate(endDate, setToNextDay),
			userID
		})
	);
	
	{
		const tokenError = await checkToken(reportRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(reportRequest)
		if (permissionError) { return permissionError; }
	}
	
	report = JSON.parse(reportRequest.responseText)
	
	const {
		userLogs
	} = report
	
	const frameDocument = rCreateReportFrame()
	frameDocument.body.innerHTML += htmlFiles['report-template-user.html']
	
	rSetText('date-generated', (new Date()).toString())
	rSetText('start-date',
		startDate ?
			rFormatInputDate(startDate) :
			'[Indefinite]'
	)
	rSetText('end-date',
		endDate ?
			rFormatInputDate(endDate) :
			rFormatInputDate(new Date())
	)
	rSetText('user', user)
	
	for (const log of userLogs) {
		log.formattedDate = rFormatDateAndTime(log.date)
		
		var action = log.action
		try {
			const objectString = /{.*}/g.exec(action)
			object = JSON.parse(objectString)
			action = action.replace(objectString, JSON.stringify(object, null, 4))
		} catch (err) {}
		
		log.action = action
	}
	
	createTable(
		frameDocument.getElementById('user-logs'),
		{
			userID: 'User ID',
			fullName: 'Full Name',
			username: 'Username',
			action: 'Action',
			formattedDate: 'Date'
		},
		userLogs,
		{
			minRows: 1
		}
	)
	
}

function rPrintReport() {
	rFrame.contentWindow.print()
}

function rClearData() {
	rFrame = undefined
}
