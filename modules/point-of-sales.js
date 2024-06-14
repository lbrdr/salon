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
				date: record.date
			})
		);
		
		res.statusCode = 200
		res.end(JSON.stringify(salesRecords))
		
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
	
}



module.exports = {
	actions
}