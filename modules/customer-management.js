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
	
	'customer-management-get-customers': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }		
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const customers = database.getCustomers().map(
			(customer) => ({
				id: customer.id,
				fullName: customer.full_name,
				contact: customer.contact,
				preferredStaffID: customer.preferred_staff_id,
				dateRegistered: customer.date_registered
			})
		);
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(customers))
		
	},
	
	'customer-management-get-customer-by-id': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }		
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const customerID = await getRequestBody(req);
		
		const customer = database.getCustomerByID(customerID)
		
		if (!customer) {
			res.statusCode = 204
			res.statusMessage = 'Customer not found'
			res.end()
			return
		}
		
		const customerResponse = {
			id: customer.id,
			fullName: customer.full_name,
			contact: customer.contact,
			preferredStaffID: customer.preferred_staff_id,
			dateRegistered: customer.date_registered
		}
		
		updateToken(token)
		
		res.statusCode = 200
		res.end(JSON.stringify(customerResponse))
		
	},
	
	'customer-management-get-staff-names': async function (req, res, log, headers, body) {
		
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
	
	'customer-management-register-customer': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const newCustomer = JSON.parse(requestBody)
		
		var registerError
		
		const oldCustomer = database.getCustomerByFullName(newCustomer.fullName)
		if (oldCustomer) {
			registerError = 'A customer with the given full name already exists.'
		}
		
		if (newCustomer.preferredStaffID) {
			const staff = database.getUserByID(newCustomer.preferredStaffID)
			if (!staff) {
				registerError = 'The given preferred staff ID does not exist.'
			}
		}
		
		if (registerError) {
			res.statusCode = 204
			res.statusMessage = registerError
			res.end()
			return
		}
		
		const createResult = database.createCustomer(
			newCustomer.preferredStaffID || null,
			newCustomer.fullName,
			newCustomer.contact || null
		)
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Registered customer: ' +
			JSON.stringify(database.getCustomerByID(createResult.lastInsertRowid))
		)
		
		res.statusCode = 200
		res.end()
		
	},
	
	'customer-management-edit-customer': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const customer = JSON.parse(requestBody)
		
		var editError
		
		const targetCustomer = database.getCustomerByID(customer.id)
		if (!targetCustomer) {
			editError = 'Customer with the given customer ID does not exist.'
		}
		
		const differentCustomer = database.getCustomerByFullName(customer.fullName)
		if (differentCustomer && differentCustomer.id !== targetCustomer.id) {
			editError = 'A different customer with the given full name exists.'
		}
		
		if (customer.preferredStaffID) {
			const staff = database.getUserByID(customer.preferredStaffID)
			if (!staff) {
				editError = 'The given preferred staff ID does not exist.'
			}
		}
		
		if (editError) {
			res.statusCode = 204
			res.statusMessage = editError
			res.end()
			return
		}
		
		const editResult = database.editCustomer(
			customer.id,
			customer.preferredStaffID || null,
			customer.fullName,
			customer.contact || null
		)
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Edited customer: ' +
			JSON.stringify(database.getCustomerByID(customer.id))
		)
		
		res.statusCode = 200
		res.end()
		
	},
	
	'customer-management-get-customer-services': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const customerID = await getRequestBody(req)
		
		const customerServices = database.getOfferedServicesByCustomerID(customerID).map(
			(offeredService) => ({
				servicingStaffID: offeredService.servicing_staff_id,
				name: offeredService.name,
				date: offeredService.date
			})
		);
		
		res.statusCode = 200
		res.end(JSON.stringify(customerServices))
		
	},
	
	'customer-management-get-customers-by-search': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const requestBody = await getRequestBody(req);
		
		const searchParameters = JSON.parse(requestBody)
		
		const searchedCustomers = database.getCustomersBySearch(searchParameters).map(
			(customer) => ({
				id: customer.id,
				fullName: customer.full_name,
				contact: customer.contact,
				preferredStaffID: customer.preferred_staff_id,
				dateRegistered: customer.date_registered,
				lastService: customer.last_service
			})
		);
		
		database.createUserAction(
			user.id,
			'Searched customers: ' +
			JSON.stringify(searchParameters)
		)
		
		res.statusCode = 200
		res.end(JSON.stringify(searchedCustomers))
		
	},
	
}



module.exports = {
	actions
}