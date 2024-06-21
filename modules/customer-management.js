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


function checkCustomer(
	fullName,
	preferredStaffID
) {
	if (!fullName) {
		return 'The full name of the customer is required.'
	}
	
	if (!database.getCustomerByFullName(fullName)) {
		return 'A customer with the given full name already exists.'
	}
	
	if (
		preferredStaffID &&
		!database.getUserByID(preferredStaffID)
	) {
		return 'The given preferred staff ID does not exist.'
	}
}


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
		
		const customer = JSON.parse(requestBody)
		
		const {
			fullName,
			preferredStaffID,
			contact
		} = customer
		
		var registerError = checkCustomer(
			fullName,
			preferredStaffID
		)
		
		if (registerError) {
			res.statusCode = 204
			res.statusMessage = registerError
			res.end()
			return
		}
		
		const createResult = database.createCustomer(
			preferredStaffID || null,
			fullName,
			contact || null
		)
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Registered customer: ' +
			JSON.stringify(database.getCustomerByID(createResult.lastInsertRowid))
		)
		
		res.statusCode = 200
		res.statusMessage = 'The customer has been successfully registered with ID: ' + createResult.lastInsertRowid
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
		
		const {
			customerID,
			fullName,
			preferredStaffID,
			contact
		} = customer
		
		var editError = checkCustomer(
			fullName,
			preferredStaffID
		)
		
		if (!editError) {
			if (!database.getCustomerByID(customerID)) {
				editError = 'Invalid customer ID.'
			}
		}
		
		if (editError) {
			res.statusCode = 204
			res.statusMessage = editError
			res.end()
			return
		}
		
		const editResult = database.editCustomer(
			customerID,
			preferredStaffID || null,
			fullName,
			contact || null
		)
		
		updateToken(token)
		
		database.createUserAction(
			user.id,
			'Edited customer: ' +
			JSON.stringify(database.getCustomerByID(customerID))
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