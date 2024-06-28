var rFrame


function rCreateReportFrame() {
	if (rFrame) {
		rFrame.remove()
	}
	
	const reportPreview = document.getElementById('report-preview')
	
	rFrame = document.createElement('iframe')
	rFrame.className = 'report-frame'
	
	reportPreview.append(rFrame)
	
	const frameDocument = rFrame.contentDocument
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
	
	const startDateInput = document.getElementById('report-start-date')
	const endDateInput = document.getElementById('report-end-date')
	
	const today = new Date()
	
	const firstDayThisMonth = new Date(today)
	firstDayThisMonth.setDate(1)
	
	startDateInput.value = firstDayThisMonth.toLocaleDateString('en-CA')
	endDateInput.value = today.toLocaleDateString('en-CA')
	
	rSetupTempInputs()
	
}

async function rSetupTempInputs() {
	
	const reportType = document.getElementById('report-type').value
	
	if (reportType === 'customer') {
		if (!document.getElementById('report-customer-type')) {
			const field = document.createElement('div')
			field.className = 'report-field'
				
			const label = document.createElement('label')
			label.innerText = 'Customer Type'
			label.htmlFor = 'report-customer-type'
			
			const select = document.createElement('select')
			select.id = 'report-customer-type'
			{
				const option = document.createElement('option')
				option.value = 'newly-registered'
				option.innerText = 'Newly-Registered Customers'
				select.append(option)
			}
			{
				const option = document.createElement('option')
				option.value = 'returning/non-returning'
				option.innerText = 'Returning/Non-returning Customers'
				select.append(option)
			}
			
			field.append(label)
			field.append(select)
			document.getElementById('report-fields').append(field)
		}
	} else {
		const input = document.getElementById('report-customer-type')
		if (input) {
			input.parentElement.remove()
		}
	}
	
	if (reportType === 'sales') {
		if (!document.getElementById('report-expenses')) {
			const field = document.createElement('div')
			field.className = 'report-field'
				
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
			
			field.append(label)
			field.append(input)
			document.getElementById('report-fields').append(field)
		}
	} else {
		const input = document.getElementById('report-expenses')
		if (input) {
			input.parentElement.remove()
		}
	}
	
	if (reportType === 'user') {		
		if (!document.getElementById('report-user')) {
			
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
			
			const field = document.createElement('div')
			field.className = 'report-field'
		
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
			
			field.append(label)
			field.append(select)
			document.getElementById('report-fields').append(field)
			
		}
	} else {
		const input = document.getElementById('report-user')
		if (input) {
			input.parentElement.remove()
		}
	}
	
}



async function rGenerateReport() {
	
	rCreateReportFrame()
	
	const reportType = document.getElementById('report-type').value
	
	if (reportType === 'customer') {
		const reportError = await rGenerateCustomerReport()
		if (reportError) {rFrame.remove(); rFrame = undefined; return reportError;}
	}
	if (reportType === 'sales') {
		const reportError = await rGenerateSalesReport()
		if (reportError) {rFrame.remove(); rFrame = undefined; return reportError;}
	}
	if (reportType === 'inventory') {
		const reportError = await rGenerateInventoryReport()
		if (reportError) {rFrame.remove(); rFrame = undefined; return reportError;}
	}
	if (reportType === 'user') {
		const reportError = await rGenerateUserReport()
		if (reportError) {rFrame.remove(); rFrame = undefined; return reportError;}
	}
	
	rSetText('date-generated', (new Date()).toLocaleString())
	rSetText('user-id', currentUser.id)
	
	const frameDocument = rFrame.contentDocument
	
	const header = frameDocument.getElementById('header')
	const headerSpace = frameDocument.getElementById('header-space')
	const footer = frameDocument.getElementById('footer')
	const footerSpace = frameDocument.getElementById('footer-space')
	
	headerSpace.innerHTML = header.innerHTML
	footerSpace.innerHTML = footer.innerHTML

}



async function rGenerateCustomerReport() {
	
	const startDate = document.getElementById('report-start-date').value
	const endDate = document.getElementById('report-end-date').value
	const customerType = document.getElementById('report-customer-type').value
	
	const reportRequest = await queryRequest(
		'POST',
		{
			action: 'report-generate-customer-report',
			token
		},
		JSON.stringify({
			startDate: startDate && formatDate(startDate),
			endDate: endDate && formatDate(endDate, setToNextDay),
			customerType
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
		returningCustomers,
		nonReturningCustomers
	} = report
	
	const frameDocument = rFrame.contentDocument
	frameDocument.body.innerHTML =
		htmlFiles['report-template-header.html'] +
		htmlFiles['report-template-customer.html'] +
		htmlFiles['report-template-footer.html']
	
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
	
	function appendTable(h3Text, columns, data) {
		const body = frameDocument.getElementById('body')
	
		const h3 = frameDocument.createElement('h3')
		h3.innerText = h3Text
		
		const tableDiv = frameDocument.createElement('div')
		tableDiv.className = 'table-div'
		
		body.append(frameDocument.createElement('br'))
		body.append(h3)
		body.append(tableDiv)
		
		createTable(
			tableDiv,
			columns,
			data,
			{ minRows: 1 }
		)
	}
	
	if (summary) {		
		appendTable(
			'Customer Metrics',
			{
				classification: 'Classification',
				customers: 'No. of Customers',
				records: 'No. of Visits/Records',
				services: 'No. of Availed Services'
			},
			summary
		)
	}
	
	function formatCustomers(customers) {
		customers.forEach(
			(customer) => {
				customer.shortDateRegistered = rFormatDate(customer.dateRegistered)
				customer.shortLastRecord = customer.lastRecord && rFormatDate(customer.lastRecord)
			}
		);
	}
	
	const customerColumns = {
		id: 'ID',
		fullName: 'Full Name',
		contact: 'Contact',
		preferredStaff: 'Preferred Staff',
		shortDateRegistered: 'Date Registered',
		shortLastRecord: 'Date of Last Visit/Record'
	}
	
	if (newlyRegisteredCustomers) {
		formatCustomers(newlyRegisteredCustomers)
		
		appendTable(
			'Newly-Registered Customers',
			customerColumns,
			newlyRegisteredCustomers
		)
	}
	
	if (returningCustomers) {
		formatCustomers(returningCustomers)
		
		appendTable(
			'Returning Customers',
			customerColumns,
			returningCustomers
		)
	}
	
	if (nonReturningCustomers) {
		formatCustomers(nonReturningCustomers)
		
		appendTable(
			'Non-Returning Customers',
			customerColumns,
			nonReturningCustomers
		)
	}
	
	
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
	
	const frameDocument = rFrame.contentDocument
	frameDocument.body.innerHTML =
		htmlFiles['report-template-header.html'] +
		htmlFiles['report-template-sales.html'] +
		htmlFiles['report-template-footer.html']
	
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
	
	const frameDocument = rFrame.contentDocument
	frameDocument.body.innerHTML =
		htmlFiles['report-template-header.html'] +
		htmlFiles['report-template-inventory.html'] +
		htmlFiles['report-template-footer.html']
	
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
			amount: 'Quantity/Amount',
			itemUnit: 'Unit',
			unitCost: 'Cost Per Unit',
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
	
	const frameDocument = rFrame.contentDocument
	frameDocument.body.innerHTML =
		htmlFiles['report-template-header.html'] +
		htmlFiles['report-template-user.html'] +
		htmlFiles['report-template-footer.html']
	
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
