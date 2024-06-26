const database = require('../database.js')
const {
	getRequestBody,
	checkPermission
} = require('../server-handlers.js')
const {
	tokens,
	generateToken,
	updateToken,
	verifyToken
} = require('../server-token.js')



function checkInventoryRecordInfo(
	user,
	recordingStaffID,
	itemName,
	itemManufacturer,
	itemUnit,
	amount
) {
	
	if (!itemName) {
		return 'The item name is required.'
	}
	
	if (!itemManufacturer) {
		return 'The item manufacturer is required.'
	}
	
	if (!itemUnit) {
		return 'The unit is required.'
	}
	
	if (isNaN(amount) || amount == 0) {
		return 'Invalid amount.'
	}
	
	if (
		user.user_type !== 'admin' &&
		recordingStaffID != user.id
	) {
		return 'Cannot create a sales record for another staff.'
	}
	
	if (!database.getUserByID(recordingStaffID)) {
		return 'Invalid recording staff ID.'
	}
	
}



// Actions that the server will handle
const actions = {
	
	'inventory-management-get-inventory-records': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }		
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const records = database.getInventoryRecords().map(
			(record) => ({
				id: record.id,
				recordingStaffID: record.recording_staff_id,
				itemName: record.item_name,
				itemManufacturer: record.item_manufacturer,
				itemUnit: record.item_unit,
				amount: record.amount,
				date: record.date,
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(records))
		
	},
	
	'inventory-management-get-inventory-items': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }		
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const items = database.getInventoryItems().map(
			(item) => ({
				name: item.name,
				manufacturer: item.manufacturer,
				unit: item.unit,
				currentStock: item.current_stock,
				lastRecordDate: item.last_record_date,
				status: item.status
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(items))
		
	},
	
	'inventory-management-get-staff-names': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const staffs = database.getUsers().map(
			(staff) => ({
				id: staff.id,
				fullName: staff.full_name
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(staffs))
		
	},
	
	'inventory-management-create-inventory-record': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const newInventoryRecord = JSON.parse(requestBody)
		
		const {
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount
		} = newInventoryRecord
		
		const date = user.user_type === 'admin' ?
			newInventoryRecord.date :
			(new Date()).toJSON()
			
		newInventoryRecord.date
		
		var createError = checkInventoryRecordInfo(
			user,
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount
		)
		
		if (createError) {
			res.statusCode = 204
			res.statusMessage = createError
			res.end()
			return
		}
			
		const recordResult = database.createInventoryRecord(
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount,
			date
		)
		
		const inventoryRecordID = recordResult.lastInsertRowid
		
		database.createUserAction(
			user.id,
			'Created Inventory Record: ' +
			JSON.stringify({
				id: inventoryRecordID,
				recordingStaffID,
				itemName,
				itemManufacturer,
				itemUnit,
				amount,
				date
			})
		)
		
		res.statusCode = 200
		res.statusMessage = 'Inventory record has been created with ID: ' + inventoryRecordID
		res.end()
		
	},
	
	'inventory-management-edit-inventory-record': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const newInventoryRecord = JSON.parse(requestBody)
		
		const {
			inventoryRecordID,
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount,
			date
		} = newInventoryRecord
		
		var editError = checkInventoryRecordInfo(
			user,
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount
		)
		
		if (!editError) {
			if (!database.getInventoryRecordByID(inventoryRecordID)) {
				editError = 'Invalid inventory record ID.'
			}
		}
		
		if (editError) {
			res.statusCode = 204
			res.statusMessage = editError
			res.end()
			return
		}
			
		database.setInventoryRecord(
			inventoryRecordID,
			recordingStaffID,
			itemName,
			itemManufacturer,
			itemUnit,
			amount,
			date
		)
		
		const recordResult = database.createUserAction(
			user.id,
			'Edited Inventory Record: ' +
			JSON.stringify({
				id: inventoryRecordID,
				recordingStaffID,
				itemName,
				itemManufacturer,
				itemUnit,
				amount,
				date
			})
		)
		
		res.statusCode = 200
		res.statusMessage = 'Inventory record ' + inventoryRecordID + ' has been edited.'
		res.end()
		
	},
	
}



module.exports = {
	actions
}