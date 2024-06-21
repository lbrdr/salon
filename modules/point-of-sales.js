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


function checkSalesRecordInfo (
	user,
	customerID,
	servicingStaffID,
	services,
	payment
) {
	
	if (!(Number(payment) >= 0)) {
		return 'Invalid payment.'
	}
	
	if (
		services.find(
			(service) => !(Number(service.price) >= 0)
		)
	) {
		return 'Invalid service price.'
	}
	
	if (
		services.find(
			(service) => !database.getServiceByID(service.id)
		)
	) {
		return 'Invalid service.'
	}
	
	if (
		payment < services.reduce(
			(a, service) => a + Number(service.price),
			0
		)
	) {
		return 'Insufficient payment.'
	}
	
	if (
		customerID &&
		!database.getCustomerByID(customerID)
	) {
		return 'Invalid customer ID.'
	}
	
	if (
		user.user_type !== 'admin' &&
		servicingStaffID != user.id
	) {
		return 'Cannot create a sales record for another staff.'
	}
	
	if (!database.getUserByID(servicingStaffID)) {
		return 'Invalid servicing staff ID.'
	}
	
}


// Actions that the server will handle
const actions = {

	'point-of-sales-get-sales-records': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const salesRecords = database.getSalesRecords().map(
			(record) => ({
				id: record.id,
				customerID: record.customer_id,
				servicingStaffID: record.servicing_staff_id,
				totalPrice: record.total_price,
				payment: record.payment,
				change: record.change,
				date: record.date
			})
		);
		
		res.statusCode = 200
		res.end(JSON.stringify(salesRecords))
		
	},

	'point-of-sales-get-sales-record-by-id': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const salesRecordID = await getRequestBody(req);
		
		const record = database.getSalesRecordByID(salesRecordID)
		
		if (!record) {
			res.statusCode = 204
			res.statusMessage = 'Sales record not found'
			res.end()
			return
		}
		
		const salesRecordResponse = {
			id: record.id,
			customerID: record.customer_id,
			servicingStaffID: record.servicing_staff_id,
			totalPrice: record.total_price,
			payment: record.payment,
			change: record.change,
			date: record.date
		}
		
		res.statusCode = 200
		res.end(JSON.stringify(salesRecordResponse))
		
	},

	'point-of-sales-get-offered-services-by-sales-record-id': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const salesRecordID = await getRequestBody(req);
		
		const offeredServices = database.getOfferedServicesBySalesRecordID(salesRecordID).map(
			(offeredService) => ({
				id: offeredService.service_id,
				price: offeredService.price
			})
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(offeredServices))
		
	},

	'point-of-sales-get-customer-names': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const customers = database.getCustomers().map(
			(customer) => ({
				id: customer.id,
				fullName: customer.full_name
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(customers))
		
	},

	'point-of-sales-get-staff-names': async function (req, res, log, headers, body) {
		
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

	'point-of-sales-get-services': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const services = database.getServices().map(
			(service) => ({
				id: service.id,
				name: service.name,
				defaultPrice: service.default_price
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(services))
		
	},
	
	'point-of-sales-create-sales-record': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const newSalesRecord = JSON.parse(requestBody)
		
		const {
			customerID,
			servicingStaffID,
			services,
			payment
		} = newSalesRecord
		
		var createError = checkSalesRecordInfo(
			user,
			customerID,
			servicingStaffID,
			services,
			payment
		)
		
		if (createError) {
			res.statusCode = 204
			res.statusMessage = createError
			res.end()
			return
		}
			
		const recordResult = database.createSalesRecord(
			user.id,
			customerID || null,
			payment
		)
		
		const salesRecordID = recordResult.lastInsertRowid
		
		for (const service of newSalesRecord.services) {
			database.createOfferedService(
				salesRecordID,
				service.id,
				service.price
			)
		}
		
		createdSalesRecord = database.getSalesRecordByID(salesRecordID)
		createdSalesRecord.offered_services = database.getOfferedServicesBySalesRecordID(salesRecordID)
		
		database.createUserAction(
			user.id,
			'Created Sales Record: ' +
			JSON.stringify(createdSalesRecord)
		)
		
		res.statusCode = 200
		res.statusMessage = 'Sales record has been created with ID: ' + salesRecordID
		res.end()
		
	},
	
	'point-of-sales-edit-sales-record': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const newSalesRecord = JSON.parse(requestBody)
		
		const {
			salesRecordID,
			customerID,
			servicingStaffID,
			services,
			payment
		} = newSalesRecord
		
		var createError
		
		createError = checkSalesRecordInfo(
			user,
			customerID,
			servicingStaffID,
			services,
			payment
		)
		
		if (!createError) {
			if (!database.getSalesRecordByID(salesRecordID)) {
				createError = 'Invalid sales record ID.'
			}
		}
		
		if (createError) {
			res.statusCode = 204
			res.statusMessage = createError
			res.end()
			return
		}
		
		database.setSalesRecord(
			salesRecordID,
			servicingStaffID,
			customerID || null,
			payment
		)
		
		database.voidOfferedServicesBySalesRecordID(salesRecordID)
		
		for (const service of newSalesRecord.services) {
			database.createOfferedService(
				salesRecordID,
				service.id,
				service.price
			)
		}
		
		createdSalesRecord = database.getSalesRecordByID(salesRecordID)
		createdSalesRecord.offered_services = database.getOfferedServicesBySalesRecordID(salesRecordID)
		
		database.createUserAction(
			user.id,
			'Edited Sales Record: ' +
			JSON.stringify(createdSalesRecord)
		)
		
		res.statusCode = 200
		res.statusMessage = 'Sales record ' + salesRecordID + ' has been edited.'
		res.end()
		
	},
	
}



module.exports = {
	actions
}