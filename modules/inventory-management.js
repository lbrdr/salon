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
	
	'inventory-management-get-inventory-items': async function (req, res, log, headers, body) {
		
		const token = headers.token
		
		const { tokenError, user } = verifyToken(token, res)
		if (tokenError) { return }		
		const { permissionError } = checkPermission(user.user_type, ['staff', 'admin'], res)
		if (permissionError) { return }
		
		const items = database.getInventoryItems().map(
			(item) => ({
				name: item.name,
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