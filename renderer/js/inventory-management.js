var imInventoryItemTable
var imInventoryItemData
var imInventoryRecordTable
var imInventoryRecordData
var imViewedItem
var imStaffData



async function imSetupInventoryItemTable(selectable) {

	const itemRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-inventory-items',
			token
		},
	);
	
	{
		const tokenError = await checkToken(itemRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(itemRequest)
		if (permissionError) { return; }
	}
	
	imInventoryItemData = JSON.parse(itemRequest.responseText)
	
	imInventoryItemData.forEach(
		(item) => {
			
			item.shortLastRecordDate = (new Date(item.lastRecordDate)).toDateString()
			
			item.records = {
				value: 'View/Edit',
				onclick: () => {
					imViewItemRecords(item)
				}
			}
			
		}
	);
	
	const inventoryItems = [...imInventoryItemData]
	inventoryItems.sort(
		(a, b) => a.unit.localeCompare(b.unit)
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
		
		imInventoryRecordTable.html.remove()
		imInventoryRecordTable = undefined
		
		if (currentUser.userType === 'admin') {
			tableDiv.parentElement.lastChild.remove()
		}
		
	}
	
	imInventoryItemTable = createTable(
		tableDiv,
		{
			name: 'Item Name',
			currentStock: 'Current Stock',
			unit: 'Unit',
			shortLastRecordDate: 'Last Record Date',
			status: 'Status',
			records: 'Records'
		},
		inventoryItems,
		{
			itemsPerPage: 9
		}
	)
	
}
	
function imViewItemRecords(item) {
	
	setSecondary('inventory-item-records')
	
}

function imCloseItemRecords() {
}



async function imSetupInventoryRecordTable(item) {
	
	const recordRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-inventory-records',
			token
		}
	);
	
	{
		const tokenError = await checkToken(recordRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(recordRequest)
		if (permissionError) { return; }
	}
	
	const staffRequest = await queryRequest(
		'POST',
		{
			action: 'inventory-management-get-staff-names',
			token
		}
	);
	
	{
		const tokenError = await checkToken(staffRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(staffRequest)
		if (permissionError) { return; }
	}
	
	imInventoryRecordData = JSON.parse(recordRequest.responseText)
	imStaffData = JSON.parse(staffRequest.responseText)

	imInventoryRecordData.forEach(
		(record) => {
			
			record.shortDate = (new Date(record.date)).toDateString()
			
			const recordingStaff = imStaffData.find(
				(staff) => record.id === record.recordingStaffID
			)
			
			if (recordingStaff) {
				record.recordingStaff = recordingStaff.id + ' - ' + recordingStaff.fullName
			}
			
		}
	);
	
	const inventoryRecords = [...imInventoryRecordData]
	inventoryRecords.sort(
		(a, b) => a.unit.localeCompare(b.unit)
	)
	inventoryRecords.sort(
		(a, b) => a.name.localeCompare(b.name)
	)
	inventoryRecords.sort(
		(a, b) => Date.parse(b.lastRecordDate) - Date.parse(a.lastRecordDate)
	)
	
	if (imInventoryRecordTable) {
		imInventoryRecordTable.setData(inventoryRecords)
		return
	}
	
	const tableDiv = document.getElementById('inventory-management-table')
	
	if (imInventoryItemTable) {
		
		imInventoryItemTable.html.remove()
		imInventoryItemTable = undefined
		
		if (currentUser.userType === 'admin') {
			const bottomDiv = document.createElement('div')
			bottomDiv.id = 'module-bottom'
			const button = document.createElement('div')
			button.className = 'button'
			button.onclick = () => {
				imEditInventoryRecord(imInventoryRecordTable.selected)
			}
			const icon = document.createElement('div')
			icon.className = 'icon edit-icon'
			button.append(icon)
			button.append(' Edit Inventory Record')
			bottomDiv.append(button)
			tableDiv.parentElement.append(bottomDiv)
		}
		
	}
	
	imInventoryRecordTable = createTable(
		tableDiv,
		{
			id: 'ID',
			recordingStaff: 'Recording Staff',
			itemName: 'Item Name',
			amount: 'Amount Gained/Lost',
			itemUnit: 'Unit',
			shortDate: 'Date Recorded'
		},
		inventoryRecords,
		{
			minRows: 8
		}
	)
	
}



async function imSetupInventoryManagementTable() {
	const itemsViewRadio = document.getElementById('inventory-management-table-switch-items')
	
	if (itemsViewRadio.checked) {
		await imSetupInventoryItemTable()
	} else {
		await imSetupInventoryRecordTable()
	}
}



function imClearData() {
	imInventoryItemTable = undefined
	imInventoryItemData = undefined
	imInventoryRecordTable = undefined
	imInventoryRecordData = undefined
	imStaffData = undefined
}