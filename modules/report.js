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


// Actions that the server will handle
const actions = {
	
	'report-get-users': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const users = database.getUsers().map(
			(_user) => ({
				id: _user.id,
				fullName: _user.full_name,
				username: _user.username
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(users))
		
	},

	'report-generate-customer-report': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const reportParameters = JSON.parse(requestBody)
		
		const {
			startDate,
			endDate,
			customerType
		} = reportParameters
		
		const metrics = database.getCustomerMetrics(startDate, endDate, customerType)
		
		const {
			summary,
			newlyRegisteredCustomers,
			returningCustomers,
			nonReturningCustomers
		} = metrics
		
		function formatCustomer(customer) {
			return {
				id: customer.id,
				fullName: customer.full_name,
				contact: customer.contact,
				preferredStaffID: customer.preferred_staff_id,
				preferredStaff: customer.preferred_staff,
				dateRegistered: customer.date_registered,
				lastRecord: customer.last_record
			}
		}
		
		const report = {
			summary,
			newlyRegisteredCustomers: newlyRegisteredCustomers?.map(formatCustomer),
			returningCustomers: returningCustomers?.map(formatCustomer),
			nonReturningCustomers: nonReturningCustomers?.map(formatCustomer)
		}
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Generated customer report'
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(report))
		
	},

	'report-generate-sales-report': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const reportParameters = JSON.parse(requestBody)
		
		const {
			startDate,
			endDate,
			expenses
		} = reportParameters
		
		const metrics = database.getSalesMetrics(startDate, endDate, expenses)
		
		const {
			summary,
			salesRecords
		} = metrics
		
		const report = {
			summary: {
				grossIncome: summary.gross_income,
				expenses: summary.expenses,
				netIncome: summary.net_income
			},
			salesRecords: salesRecords.map(
				(record) => ({
					id: record.id,
					customerID: record.customer_id,
					customer: record.customer,
					servicingStaffID: record.servicing_staff_id,
					servicingStaff: record.servicing_staff,
					totalPrice: record.total_price,
					payment: record.payment,
					change: record.change,
					date: record.date
				})
			)
		}
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Generated sales report'
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(report))
		
	},

	'report-generate-inventory-report': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const reportParameters = JSON.parse(requestBody)
		
		const {
			startDate,
			endDate
		} = reportParameters
		
		const metrics = database.getInventoryMetrics(startDate, endDate)
		
		const {
			inventoryItems,
			inventoryRecords
		} = metrics
		
		const report = {
			inventoryItems: inventoryItems.map(
				(item) => ({
					name: item.name,
					manufacturer: item.manufacturer,
					startStock: item.start_stock,
					stockChanges:
						item.stock_changes > 0 ?
							'+' + item.stock_changes :
							'' + item.stock_changes,
					endStock: item.end_stock,
					unit: item.unit,
				})
			),
			inventoryRecords: inventoryRecords.map(
				(record) => ({
					id: record.id,
					recordingStaffID: record.recording_staff_id,
					recordingStaff: record.recording_staff,
					itemName: record.item_name,
					itemManufacturer: record.item_manufacturer,
					itemUnit: record.item_unit,
					amount: record.amount,
					date: record.date,
				})
			)
		}
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Generated inventory report'
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(report))
		
	},

	'report-generate-user-report': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req)
		
		const reportParameters = JSON.parse(requestBody)
		
		const {
			startDate,
			endDate,
			userID
		} = reportParameters
		
		const userLogs = database.getUserLogs(startDate, endDate, userID)
		
		const report = {
			userLogs: userLogs.map(
				(log) => ({
					userID: log.user_id,
					fullName: log.full_name,
					username: log.username,
					action: log.action,
					date: log.date
				})
			)
		}
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Generated user report'
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(report))
		
	},
	
}



module.exports = {
	actions
}