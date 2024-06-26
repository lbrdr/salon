var imInventoryItemTable
var imInventoryItemData
var imInventoryRecordTable
var imInventoryRecordData
var imStaffData
var imViewedInventoryItem

async function imGetStaffData() {
	
	const staffRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-staff-names',
			token
		},
	);
	
	{
		const tokenError = await checkToken(staffRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(staffRequest)
		if (permissionError) { return permissionError; }
	}
	
	imStaffData = JSON.parse(staffRequest.responseText)
	
}

async function imGetInventoryItemData(showError) {
	
	const itemRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-inventory-items',
			token
		},
	);
	
	{
		const tokenError = await checkToken(itemRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(itemRequest)
		if (permissionError) { return permissionError; }
	}
	
	imInventoryItemData = JSON.parse(itemRequest.responseText)
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	const errorItems = []
	
	imInventoryItemData.forEach(
		(item) => {
			
			item.shortLastRecordDate = (new Date(item.lastRecordDate)).toDateString()
			
			const currentStock = item.currentStock
			item.coloredCurrentStock = createColoredSpan(currentStock)
			item.coloredStatus = createColoredSpan(currentStock, item.status)
			
			if (currentStock < 0) {
				item.error = true
				errorItems.push(item)
			}
			
			item.records = {
				value: userIsAdmin ? 'View/Edit' : 'View',
				onclick: () => {
					imViewedInventoryItem = item
					imViewItemRecords()
				}
			}
			
		}
	);
	
	if (showError && errorItems.length) {
		const errorDiv = document.createElement('div')
		
		const errorTable = createTable(
			errorDiv,
			{
				name: 'Name',
				manufacturer: 'Manufacturer',
				coloredCurrentStock: 'Stock',
				unit: 'Unit'
			},
			errorItems
		)
		
		errorTable.html.style.marginTop = '0.5em'
		
		errorDiv.prepend('Errors have been found for the following item/s:')
		
		createMessageDialogue('error', 'Inventory Error', errorDiv)
	}
	
}

async function imGetInventoryRecordData() {
	
	const recordRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-inventory-records',
			token
		}
	);
	
	{
		const tokenError = await checkToken(recordRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(recordRequest)
		if (permissionError) { return permissionError; }
	}
	
	imInventoryRecordData = JSON.parse(recordRequest.responseText)
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	imInventoryRecordData.forEach(
		(record) => {
			
			record.shortDate = (new Date(record.date)).toDateString()
			
			record.coloredAmount = createColoredSpan(record.amount)
			
			const recordingStaff = imStaffData.find(
				(staff) => staff.id == record.recordingStaffID
			)
			
			// const recordItem = imInventoryItemData.find(
				// (item) => 
					// item.name === record.itemName &&
					// item.manufacturer === record.itemManufacturer &&
					// item.unit === record.itemUnit
			// )
			
			// if (
				// recordItem &&
				// recordItem.currentStock < 0
			// ) {
				// record.error = true
			// }
			
			if (recordingStaff) {
				record.recordingStaff = recordingStaff.id + ' - ' + recordingStaff.fullName
			}
			
		}
	);
	
}

async function imGetData(showError) {
	const staffError = await imGetStaffData()
	if (staffError) { return staffError; }
	const itemError = await imGetInventoryItemData(showError)
	if (itemError) { return itemError; }
	const recordError = await imGetInventoryRecordData()
	if (recordError) { return recordError; }
}



async function imSetupInventoryItemTable() {
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	const inventoryItems = [...imInventoryItemData]
	inventoryItems.sort(
		(a, b) => a.unit.localeCompare(b.unit)
	)
	inventoryItems.sort(
		(a, b) => a.manufacturer.localeCompare(b.manufacturer)
	)
	inventoryItems.sort(
		(a, b) => a.name.localeCompare(b.name)
	)
	inventoryItems.sort(
		(a, b) => Date.parse(b.lastRecordDate) - Date.parse(a.lastRecordDate)
	)
	
	if (imInventoryItemTable) {
		imInventoryItemTable.setData(inventoryItems)
		return
	}
	
	const tableDiv = document.getElementById('inventory-management-table')
	
	if (imInventoryRecordTable) {
		
		imInventoryRecordTable.html.parentElement.children[1].remove()
		imInventoryRecordTable.html.remove()
		imInventoryRecordTable = undefined
		
		// if (userIsAdmin) {
			// tableDiv.parentElement.lastChild.remove()
		// }
		
	}
	
	imInventoryItemTable = createTable(
		tableDiv,
		{
			name: 'Name',
			manufacturer: 'Manufacturer',
			coloredCurrentStock: 'Current Stock',
			unit: 'Unit',
			coloredStatus: 'Status',
			shortLastRecordDate: 'Last Record Date',
			records: 'Records'
		},
		inventoryItems,
		{
			itemsPerPage: userIsAdmin ? 6 : 8,
		}
	)
	
}



async function imSetupInventoryRecordTable() {
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	const inventoryRecords = [...imInventoryRecordData]
	inventoryRecords.sort(
		(a, b) => a.itemUnit.localeCompare(b.itemUnit)
	)
	inventoryRecords.sort(
		(a, b) => a.itemManufacturer.localeCompare(b.itemManufacturer)
	)
	inventoryRecords.sort(
		(a, b) => a.itemName.localeCompare(b.itemName)
	)
	inventoryRecords.sort(
		(a, b) => b.id - a.id
	)
	inventoryRecords.sort(
		(a, b) => Date.parse(b.date) - Date.parse(a.date)
	)
	
	if (imInventoryRecordTable) {
		imInventoryRecordTable.setData(inventoryRecords)
		return
	}
	
	const tableDiv = document.getElementById('inventory-management-table')
	
	if (imInventoryItemTable) {
		
		imInventoryItemTable.html.parentElement.children[1].remove()
		imInventoryItemTable.html.remove()
		imInventoryItemTable = undefined
		
	}
	
	// if (userIsAdmin) {
		// const bottomDiv = document.createElement('div')
		// bottomDiv.id = 'module-bottom'
		// const button = document.createElement('div')
		// button.className = 'button'
		// button.onclick = () => {
			// imEditInventoryRecord(imInventoryRecordTable.selected)
		// }
		// const icon = document.createElement('div')
		// icon.className = 'icon edit-icon'
		// button.append(icon)
		// button.append(' Edit Inventory Record')
		// bottomDiv.append(button)
		// tableDiv.parentElement.append(bottomDiv)
	// }
	
	imInventoryRecordTable = createTable(
		tableDiv,
		{
			id: 'ID',
			itemName: 'Item Name',
			itemManufacturer: 'Item Manufacturer',
			coloredAmount: 'Amount',
			itemUnit: 'Unit',
			recordingStaff: 'Recording Staff',
			shortDate: 'Date Recorded'
		},
		inventoryRecords,
		{
			itemsPerPage: userIsAdmin ? 5 : 7,
			select: userIsAdmin,
		}
	)
	
}



async function imSetupInventoryManagementTable(showError) {
	
	{
		const getError = await imGetData(showError)
		if (getError) { return getError; }
	}
	
	const itemsViewRadio = document.getElementById('inventory-management-table-switch-items')
	
	if (itemsViewRadio.checked) {
		await imSetupInventoryItemTable()
	} else {
		await imSetupInventoryRecordTable()
	}
	
	if (imViewedInventoryItem) {
		imViewedInventoryItem = imInventoryItemData.find(
			(item) =>
				item.name === imViewedInventoryItem.name &&
				item.manufacturer === imViewedInventoryItem.manufacturer &&
				item.unit === imViewedInventoryItem.unit
		)
	}
	
	if (imViewedInventoryItem) {
		await imViewItemRecords()
	}
	
}



function imGenerateDatalist(input, datalistID, values) {
	const list = document.createElement('datalist')
	list.id = datalistID
	for (const value of values) {
		const option = document.createElement('option')
		option.value = value
		list.append(option)
	}
	input.parentElement.append(list)
}

async function imSetupInventoryRecordInputs(action) {
	
	const dateInput = document.getElementById(`inventory-record-${action}-date`)
	if (action === 'creation') {
		dateInput.value = toLocalDateTime(new Date())
	}
	dateInput.disabled = currentUser.userType !== 'admin'
	
	imGenerateDatalist(
		document.getElementById(`inventory-record-${action}-item-name`),
		`inventory-record-${action}-item-names`,
		[...new Set(imInventoryItemData.map((item) => item.name))]
	)
	
	imGenerateDatalist(
		document.getElementById(`inventory-record-${action}-item-manufacturer`),
		`inventory-record-${action}-item-manufacturers`,
		[...new Set(imInventoryItemData.map((item) => item.manufacturer))]
	)
	
	imGenerateDatalist(
		document.getElementById(`inventory-record-${action}-item-unit`),
		`inventory-record-${action}-item-units`,
		[...new Set(imInventoryItemData.map((item) => item.unit))]
	)
	
	const staffInput = document.getElementById(`inventory-record-${action}-recording-staff`)
	for (const staff of imStaffData) {
		const option = document.createElement('option')
		option.value = staff.id
		option.innerText = staff.id + ' - ' + staff.fullName
		staffInput.append(option)
	}
	staffInput.value = currentUser.id
	staffInput.disabled = currentUser.userType !== 'admin'
	
}

function imCheckInventoryRecordInputs(action) {
	
	const inventoryRecordID =
		action === 'edit' ?
			document.getElementById(`inventory-record-${action}-id`).value :
			undefined;
	const recordingStaffID = document.getElementById(`inventory-record-${action}-recording-staff`).value
	const itemName = document.getElementById(`inventory-record-${action}-item-name`).value
	const itemManufacturer = document.getElementById(`inventory-record-${action}-item-manufacturer`).value
	const itemUnit = document.getElementById(`inventory-record-${action}-item-unit`).value
	const amountSign = document.getElementById(`inventory-record-${action}-amount-sign`).value
	const unsignedAmount = document.getElementById(`inventory-record-${action}-amount`).value
	const date = document.getElementById(`inventory-record-${action}-date`).value
	
	var inputValues = {
		inventoryRecordID,
		recordingStaffID,
		itemName,
		itemManufacturer,
		itemUnit,
		amount: amountSign + unsignedAmount,
		date: formatDateTime(date)
	}
	
	if (!itemName) {
		return [ 'The item name is required.' ]
	}
	
	if (!itemManufacturer) {
		return [ 'The item manufacturer is required.' ]
	}
	
	if (!itemUnit) {
		return [ 'The unit is required.' ]
	}
	
	if (isNaN(unsignedAmount)) {
		return [ 'Invalid amount.' ]
	}
	
	if (unsignedAmount == 0) {
		return [ 'The amount cannot be zero (0).' ]
	}
	
	if (unsignedAmount < 0) {
		return [ 'The amount cannot be negative. Please use the sign selector.' ]
	}
	
	return [ undefined, inputValues ]
	
}


async function imViewChanges(action) {
	
	addSecondary('inventory-stock-changes')
	
	const recordChanges = []
	
	const itemChanges = imInventoryItemData.map(
		(item) => ({
			name: item.name,
			manufacturer: item.manufacturer,
			currentStock: item.currentStock,
			resultingStock: item.currentStock,
			unit: item.unit
		})
	);
	
	var oldRecord
	var oldItem
	
	if (action === 'edit') {
		
		const recordID = document.getElementById(`inventory-record-${action}-id`).value
		
		oldRecord = imInventoryRecordData.find(
			(record) => record.id == recordID
		)
		
		if (oldRecord) {
			
			oldRecord = {...oldRecord}
			oldRecord.error = undefined
		
			oldItem = itemChanges.find(
				(item) =>
					item.name === oldRecord.itemName &&
					item.manufacturer === oldRecord.itemManufacturer &&
					item.unit === oldRecord.itemUnit
			)
			
			const similarRecords = imInventoryRecordData.filter(
				(record) =>
					record.itemName === oldRecord.itemName &&
					record.itemManufacturer === oldRecord.itemManufacturer &&
					record.itemUnit === oldRecord.itemUnit
			)
			
			if (similarRecords.length <= 1) {
				oldItem._void = true
			}
			
			oldItem.resultingStock -= oldRecord.amount
			
		} else {
			
			oldRecord = { error: true }
			
		}
			
		oldRecord.change = 'Old Record'
		
	}
	
	
	
	const itemNameInput = document.getElementById(`inventory-record-${action}-item-name`)
	const itemManufacturerInput = document.getElementById(`inventory-record-${action}-item-manufacturer`)
	const itemUnitInput = document.getElementById(`inventory-record-${action}-item-unit`)
	const amountSignInput = document.getElementById(`inventory-record-${action}-amount-sign`)
	const amountInput = document.getElementById(`inventory-record-${action}-amount`)
	const staffInput = document.getElementById(`inventory-record-${action}-recording-staff`)
	
	const itemName = itemNameInput.value
	const itemManufacturer = itemManufacturerInput.value
	const itemUnit = itemUnitInput.value
	
	const amount = Number(amountSignInput.value + amountInput.value)
	const coloredAmount = createColoredSpan(amount)
	
	const recordingStaffID = staffInput.value
	const recordingStaffObj = imStaffData.find((staff) => staff.id == recordingStaffID)
	const recordingStaff =
		recordingStaffObj ?
			recordingStaffID + ' - ' + recordingStaffObj.fullName :
			undefined
	
	
	
	var newRecord
	var newItem
	
	newRecord = {
		recordingStaffID,
		recordingStaff,
		itemName,
		itemManufacturer,
		itemUnit,
		amount,
		coloredAmount
	}
		
	if (
		!itemName ||
		!itemManufacturer ||
		!itemUnit ||
		!recordingStaff ||
		!amount
	) {
		newRecord.error = true
	}
	
	if (oldRecord) {
		newRecord.id = oldRecord.id
		newRecord.date = oldRecord.date
		newRecord.shortDate = oldRecord.shortDate
	} else {
		newRecord.date = (new Date()).toJSON()
		newRecord.shortDate = (new Date(newRecord.date)).toDateString()
	}
	
	newRecord.change = 'New Record'
	
	
	
	if (
		itemName &&
		itemManufacturer &&
		itemUnit
	) {
		
		newItem = itemChanges.find(
			(item) =>
				item.name === itemName &&
				item.manufacturer === itemManufacturer &&
				item.unit === itemUnit
		)
		
		if (!newItem) {
			newItem = {
				name: itemName,
				manufacturer: itemManufacturer,
				unit: itemUnit,
				currentStock: undefined,
				resultingStock: 0
			}
			
			itemChanges.push(newItem)
		} else {
			newItem._void = false
		}
		
		newItem.resultingStock += amount
		
	}
	
	itemChanges.forEach(
		(item) => {
			
			const currentStock = item.currentStock
			const resultingStock = item.resultingStock
			
			item.coloredResultingStock = item._void ? undefined : createColoredSpan(resultingStock - currentStock, resultingStock)
			
			if (
				isNaN(resultingStock) ||
				resultingStock < 0
			) {
				item.error = true
			}
			
		}
	)
	
	if (oldRecord) {
		recordChanges.push(oldRecord)
	}
	if (newRecord) {
		recordChanges.push(newRecord)
	}
	
	if (oldItem) {
		itemChanges.sort( (a, b) => a === oldItem ? -1 : b === oldItem ? 1 : 0 )
		oldItem.highlight = true
	}
	if (newItem) {
		itemChanges.sort( (a, b) => a === newItem ? -1 : b === newItem ? 1 : 0 )
		newItem.highlight = true
	}
	
	const recordTableDiv = document.getElementById('inventory-record-changes-table')

	createTable(
		recordTableDiv,
		{
			change: '',
			id: 'ID',
			itemName: 'Item Name',
			itemManufacturer: 'Item Manufacturer',
			coloredAmount: 'Amount',
			itemUnit: 'Unit',
			recordingStaff: 'Recording Staff',
			shortDate: 'Date Recorded'
		},
		recordChanges
	);
	
	const itemTableDiv = document.getElementById('inventory-item-changes-table')

	createTable(
		itemTableDiv,
		{
			name: 'Name',
			manufacturer: 'Manufacturer',
			currentStock: 'Current Stock',
			coloredResultingStock: 'Resulting Stock',
			unit: 'Unit',
		},
		itemChanges,
		{
			minRows: 6,
			// select: (item) => {
				// itemNameInput.value = item.name
				// itemManufacturerInput.value = item.manufacturer
				// itemUnitInput.value = item.unit	
				// imSetupResultingItemTable(action)
			// }
		}
	);
	
	// imResultingItemTable.setData(itemChanges)
	
	// if (newItem) {imResultingItemTable.setSelected(newItem)}
	
}

function imCloseChanges() {
	removeSecondary()
}

function imViewItemRecords() {
	
	setSecondary('inventory-item-records')
	
	const userIsAdmin = currentUser.userType === 'admin'
	
	const {
		name,
		manufacturer,
		unit,
		currentStock
	} = imViewedInventoryItem
	
	const itemRecords = [...imInventoryRecordData].filter(
		(record) =>
			record.itemName === name &&
			record.itemManufacturer === manufacturer &&
			record.itemUnit === unit
	)
	itemRecords.sort(
		(a, b) => a.itemUnit.localeCompare(b.itemUnit)
	)
	itemRecords.sort(
		(a, b) => a.itemManufacturer.localeCompare(b.itemManufacturer)
	)
	itemRecords.sort(
		(a, b) => a.itemName.localeCompare(b.itemName)
	)
	itemRecords.sort(
		(a, b) => b.id - a.id
	)
	itemRecords.sort(
		(a, b) => Date.parse(b.date) - Date.parse(a.date)
	)
	
	const nameDiv = document.getElementById('inventory-item-records-name')
	const manufacturerDiv = document.getElementById('inventory-item-records-manufacturer')
	const unitDiv = document.getElementById('inventory-item-records-unit')
	const currentStockDiv = document.getElementById('inventory-item-records-current-stock')
	
	nameDiv.innerText = name
	manufacturerDiv.innerText = manufacturer
	unitDiv.innerText = unit
	currentStockDiv.innerText = currentStock
	
	const tableDiv = document.getElementById('inventory-item-records-table')
	
	const tableObj = createTable(
		tableDiv,
		{
			id: 'ID',
			coloredAmount: 'Amount',
			itemUnit: 'Unit',
			recordingStaff: 'Recording Staff',
			shortDate: 'Date Recorded'
		},
		itemRecords,
		{
			minRows: userIsAdmin ? 6 : 8,
			select: userIsAdmin,
		}
	);
	
	if (userIsAdmin) {
		const columnDiv = document.getElementById('inventory-item-records-column')
		
		const bottomDiv = document.createElement('div')
		bottomDiv.id = 'inventory-item-records-bottom'
		
		const button = document.createElement('div')
		button.className = 'button'
		button.onclick = () => {
			imEditInventoryRecord(tableObj.selected)
		}
		
		const icon = document.createElement('div')
		icon.className = 'icon edit-icon'
		
		button.append(icon)
		button.append(' Edit Inventory Record')
		bottomDiv.append(button)
		columnDiv.append(bottomDiv)
	}
	
}

function imCloseItemRecords() {
	imViewedInventoryItem = undefined
	clearSecondary()
}



async function imCreateInventoryRecord () {
	
	setSecondary('inventory-record-creation')
	
	await imSetupInventoryRecordInputs('creation')
	
}

async function imSubmitCreation() {
	
	var [ inputError, inputValues ] = imCheckInventoryRecordInputs('creation')
	
	if (inputError) {
		createMessageDialogue('error', 'Inventory Record Creation Failed', inputError)
		return
	}
	
	const {
		recordingStaffID,
		itemName,
		itemManufacturer,
		itemUnit,
		amount,
		date
	} = inputValues
	
	const createRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-create-inventory-record',
			token
		},
		JSON.stringify({
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount,
			date
		})
	);
	
	{
		const tokenError = await checkToken(createRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(createRequest)
		if (permissionError) { return; }
	}
	
	if (createRequest.status === 200) {
		imResultingItemTable = undefined
		await setPage('inventory-management')
		createMessageDialogue('success', 'Inventory Record Creation Successful', createRequest.statusText)
		return
	}
	
	createMessageDialogue('error', 'Inventory Record Creation Failed', createRequest.statusText)
	
}


async function imCancelCreation () {
	imResultingItemTable = undefined
	clearSecondary()
}



async function imEditInventoryRecord(selectedRecord) {
	
	addSecondary('inventory-record-edit')
	
	await imSetupInventoryRecordInputs('edit')
	
	if (selectedRecord) {
		document.getElementById('inventory-record-edit-id').value = selectedRecord.id
		await imCheckID()
	}
	
}

async function imCheckID() {
	
	{
		const getError = await imGetData()
		
		if (getError) {
			createMessageDialogue('error', 'Inventory Record ID Check Failed', getError)
			return
		}
	}
	
	const inventoryRecordID = document.getElementById('inventory-record-edit-id').value
	
	if (!inventoryRecordID) {
		createMessageDialogue('error', 'Inventory Record ID Check Failed', 'The inventory record ID is required.')
		return
	}
	
	const inventoryRecord = imInventoryRecordData.find(
		(record) => record.id == inventoryRecordID
	)
	
	if (!inventoryRecord) {
		createMessageDialogue('error', 'Inventory Record ID Check Failed', 'Inventory record not found.')
		return
	}
	
	recordingStaffInput = document.getElementById('inventory-record-edit-recording-staff')
	itemNameInput = document.getElementById('inventory-record-edit-item-name')
	itemManufacturerInput = document.getElementById('inventory-record-edit-item-manufacturer')
	itemUnitInput = document.getElementById('inventory-record-edit-item-unit')
	amountSignInput = document.getElementById('inventory-record-edit-amount-sign')
	unsignedAmountInput = document.getElementById('inventory-record-edit-amount')
	dateInput = document.getElementById('inventory-record-edit-date')
	
	recordingStaffInput.value = inventoryRecord.recordingStaffID
	itemNameInput.value = inventoryRecord.itemName
	itemManufacturerInput.value = inventoryRecord.itemManufacturer
	itemUnitInput.value = inventoryRecord.itemUnit
	amountSignInput.value = inventoryRecord.amount < 0 ? '-' : '+'
	unsignedAmountInput.value = Math.abs(inventoryRecord.amount)
	dateInput.value = toLocalDateTime(new Date(inventoryRecord.date))
	
}

async function imSubmitEdit() {
	
	var [ inputError, inputValues ] = imCheckInventoryRecordInputs('edit')
	
	if (inputError) {
		createMessageDialogue('error', 'Inventory Record Edit Failed', inputError)
		return
	}
	
	const {
		inventoryRecordID,
		recordingStaffID,
		itemName,
		itemManufacturer,
		itemUnit,
		amount,
		date
	} = inputValues
	
	const editRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-edit-inventory-record',
			token
		},
		JSON.stringify({
			inventoryRecordID,
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount,
			date
		})
	);
	
	{
		const tokenError = await checkToken(editRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(editRequest)
		if (permissionError) { return; }
	}
	
	if (editRequest.status === 200) {
		imResultingItemTable = undefined
		removeSecondary()
		await imSetupInventoryManagementTable(true)
		createMessageDialogue('success', 'Inventory Record Edit Successful', editRequest.statusText)
		return
	}
	
	createMessageDialogue('error', 'Inventory Record Edit Failed', editRequest.statusText)
	
}


async function imCancelEdit() {
	imResultingItemTable = undefined
	removeSecondary()
}









function imClearData() {
	imInventoryItemTable = undefined
	imInventoryItemData = undefined
	imInventoryRecordTable = undefined
	imInventoryRecordData = undefined
	imStaffData = undefined
	imViewedInventoryItem = undefined
}