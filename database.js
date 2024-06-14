const path = require('path')
const fs = require('fs')
const sqlite3 = require('better-sqlite3')



const dbFile = 'test.db'
const dbPath = path.resolve(__dirname, 'database', dbFile)
const options = {}
var db



// Create backup of main db file if it exists
// Create db file if it does not exist
var newDb
try {
	fs.accessSync(dbPath, fs.constants.F_OK)
} catch (err) {
	fs.writeFileSync(dbPath, '')
	newDb = true
}

open()
initialize()
if (newDb) {
	createSampleData()
}



// Open database
function open() {
	if (db === undefined) {
		db = sqlite3(dbPath, options)
	}
}



// Close database
function close() {
	db.close()
	db = undefined
}



// Initialize tables
function initialize() {
	
	db.prepare(
		`CREATE TABLE IF NOT EXISTS user (
			id INTEGER PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			user_type TEXT NOT NULL,
			full_name TEXT NOT NULL
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS security_question (
			id INTEGER PRIMARY KEY,
			user_id INTEGER,
			question TEXT NOT NULL,
			answer TEXT NOT NULL,
			FOREIGN KEY(user_id) REFERENCES user(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS user_action (
			id INTEGER PRIMARY KEY,
			user_id INTEGER,
			action TEXT NOT NULL,
			date TEXT NOT NULL,
			FOREIGN KEY(user_id) REFERENCES user(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS customer (
			id INTEGER PRIMARY KEY,
			preferred_staff_id INTEGER,
			full_name TEXT UNIQUE NOT NULL,
			contact TEXT,
			date_registered TEXT NOT NULL,
			FOREIGN KEY(preferred_staff_id) REFERENCES user(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS inventory_item (
			id INTEGER PRIMARY KEY ASC,
			item_name TEXT NOT NULL,
			manufacturer TEXT,
			status TEXT NOT NULL
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS inventory_record (
			id INTEGER PRIMARY KEY ASC,
			recording_staff_id INTEGER,
			date TEXT NOT NULL,
			FOREIGN KEY(recording_staff_id) REFERENCES user(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS inventory_measurement (
			id INTEGER PRIMARY KEY ASC,
			inventory_record_id INTEGER,
			inventory_item_id INTEGER,
			FOREIGN KEY(inventory_record_id) REFERENCES inventory_record(id),
			FOREIGN KEY(inventory_item_id) REFERENCES inventory_item(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS sales_record (
			id INTEGER PRIMARY KEY ASC,
			servicing_staff_id INTEGER,
			customer_id INTEGER,
			total_price REAL NOT NULL,
			payment REAL NOT NULL,
			change REAL NOT NULL,
			date TEXT NOT NULL,
			FOREIGN KEY(servicing_staff_id) REFERENCES user(id),
			FOREIGN KEY(customer_id) REFERENCES customer(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS service (
			id INTEGER PRIMARY KEY ASC,
			name TEXT NOT NULL,
			default_price REAL NOT NULL
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS offered_service (
			id INTEGER PRIMARY KEY ASC,
			sales_record_id INTEGER,
			service_id INTEGER,
			price REAL NOT NULL,
			FOREIGN KEY(sales_record_id) REFERENCES sales_record(id),
			FOREIGN KEY(service_id) REFERENCES service(id)
		)`
	).run();
	
}

function createSampleData() {
	
	createUser('tmvelasquez', 'velasquez123', 'admin', 'Trisha Mae Velasquez')
	createUser('crpoblacion', 'lab123', 'staff', 'Carlo Raniel Poblacion')
	createUser('jcdomingo', 'domingo123', 'staff', 'Jeremy Charles Domingo')
	
	createSecurityQuestion(
		1,
		'Where did you go on your favorite vacation as a child?',
		'Pasig River'
	)
	createSecurityQuestion(
		2,
		'What is the radius of a circle that circumscribes your favorite right triangle?',
		'5cm'
	)
	createSecurityQuestion(
		3,
		'Who is your first love?',
		'Raihzza'
	)
	
	function randomNo() {
		return '09' + Math.floor(999999999 * Math.random()).toString().padStart(9, '0')
	}
	
	createCustomer(null, 'Kristan Jay Sebastian', randomNo())
	createCustomer(2, 'Marx Dela Cruz', randomNo())
	createCustomer(2, 'Deinielle Anjhelo Santiago', randomNo())
	createCustomer(1, 'Lui Andrei Reyes', randomNo())
	createCustomer(1, 'Bianca Louise Del Mundo', randomNo())
	createCustomer(3, 'Dingdong Dantes', randomNo())
	createCustomer(3, 'Piolo Pascual', randomNo())
	createCustomer(3, 'Paulo Avelino', randomNo())
	createCustomer(3, 'Richard Gutierrez', randomNo())
	createCustomer(3, 'Dennis Trillo', randomNo())
	createCustomer(3, 'Jericho Rosales', randomNo())
	createCustomer(2, 'Marian Rivera', randomNo())
	createCustomer(2, 'Andrea Brillantes', randomNo())
	createCustomer(2, 'Anne Curtis', randomNo())
	createCustomer(2, 'Angel Locsin', randomNo())
	createCustomer(2, 'Nadine Lustre', randomNo())
	createCustomer(2, 'Katrine Bernardo', randomNo())
	
	createService('Haircut / Shampoo', 200)
	createService('Blow Dry / Ironing', 500)
	createService('Hair Oil / Hair Spa', 800)
	createService('Hair Perming', 500)
	createService('Hair & Make-up', 400)
	createService('Hair Dye / Highlights / Cellophane & Make-up', 800)
	createService('Hair Relax / Rebond / Straightening', 700)
	createService('Facial / Diamond Peel', 800)
	createService('Wart Removal', 1500)
	createService('Eyebrow Shave / Threading', 1000)
	createService('Eyelash Perm / Extension', 2000)
	createService('Body Scrub / Body Massage', 750)
	createService('Xiamen Foot Massage', 500)
	createService('Hand & Foot Spa / Manicure & Pedicure', 600)
	createService('Hand & Foot Paraffin', 2000)
	createService('Waxing - Armpit / Legs', 500)
	createService('Goods', 0)
	
	{
		const salesRecordID = createSalesRecord(2, 12, 400).lastInsertRowid
		createOfferedService(salesRecordID, 5, 400)
	}
	{
		const salesRecordID = createSalesRecord(2, 14, 400).lastInsertRowid
		createOfferedService(salesRecordID, 5, 400)
	}
	{
		const salesRecordID = createSalesRecord(2, 16, 2000).lastInsertRowid
		createOfferedService(salesRecordID, 12, 750)
		createOfferedService(salesRecordID, 14, 600)
		createOfferedService(salesRecordID, 16, 500)
	}
	{
		const salesRecordID = createSalesRecord(2, 15, 400).lastInsertRowid
		createOfferedService(salesRecordID, 5, 400)
	}
	{
		const salesRecordID = createSalesRecord(1, null, 1500).lastInsertRowid
		createOfferedService(salesRecordID, 2, 1500)
	}
	{
		const salesRecordID = createSalesRecord(1, null, 1500).lastInsertRowid
		createOfferedService(salesRecordID, 2, 1500)
	}
	{
		const salesRecordID = createSalesRecord(1, null, 1500).lastInsertRowid
		createOfferedService(salesRecordID, 2, 1500)
	}
	{
		const salesRecordID = createSalesRecord(2, null, 1000).lastInsertRowid
		createOfferedService(salesRecordID, 1, 300)
	}
	{
		const salesRecordID = createSalesRecord(2, 2, 1500).lastInsertRowid
		createOfferedService(salesRecordID, 1, 200)
		createOfferedService(salesRecordID, 3, 1000)
	}
	{
		const salesRecordID = createSalesRecord(3, 7, 1500).lastInsertRowid
		createOfferedService(salesRecordID, 2, 1500)
		createOfferedService(salesRecordID, 3, 1200)
	}
	{
		const salesRecordID = createSalesRecord(3, 7, 500).lastInsertRowid
		createOfferedService(salesRecordID, 1, 200)
	}
	{
		const salesRecordID = createSalesRecord(3, 11, 200).lastInsertRowid
		createOfferedService(salesRecordID, 1, 200)
	}
	{
		const salesRecordID = createSalesRecord(3, 10, 1200).lastInsertRowid
		createOfferedService(salesRecordID, 1, 200)
		createOfferedService(salesRecordID, 2, 1000)
	}
	{
		const salesRecordID = createSalesRecord(3, 8, 200).lastInsertRowid
		createOfferedService(salesRecordID, 1, 200)
	}
	
}



// Encode string to escape quotes (for preventing sql injection)



// Create user
function createUser(username, password, userType, fullName) {
	
	return db.prepare(
		`INSERT INTO user (
			username,
			password,
			user_type,
			full_name
		) VALUES (?, ?, ?, ?)`
	).run(
		username,
		password,
		userType,
		fullName
	);
	
}



// Get a user by user id
function getUserByID(userID) {
	
	return db.prepare(
		`SELECT * FROM user WHERE id=?`
	).get(userID);
	
}



// Get a user by username
function getUserByUsername(username) {
	
	return db.prepare(
		`SELECT * FROM user WHERE username=?`
	).get(username)
	
}



// Get all users
function getUsers(id) {
	
	return db.prepare(
		`SELECT * FROM user`
	).all()
	
}



// Get security questions by user id
function createSecurityQuestion(userID, question, answer) {
	
	return db.prepare(
		`INSERT INTO security_question (
			user_id,
			question,
			answer
		) VALUES (?, ?, ?)`
	).run(
		userID,
		question,
		answer
	);
	
}

// Get security questions by user id
function getSecurityQuestions(userID) {
	
	return db.prepare(
		`SELECT * FROM security_question WHERE user_id=?`
	).all(userID)
	
}

// Set user password by user id
function setUserPassword(userID, password) {
	
	return db.prepare(
		`UPDATE user SET password=? WHERE id=?`
	).run(password, userID)
	
}

// Create customer
function createCustomer(preferredStaffID, fullName, contact) {
	
	return db.prepare(
		`INSERT INTO customer (
			preferred_staff_id,
			full_name,
			contact,
			date_registered
		) VALUES (?, ?, ?, ?)`
	).run(
		preferredStaffID,
		fullName,
		contact,
		(new Date()).toJSON()
	);
	
}

// Get all customers
function getCustomers() {
	
	return db.prepare(
		`SELECT * FROM customer`
	).all()
	
}

// Get customer with the given ID
function getCustomerByID(customerID) {
	
	return db.prepare(
		`SELECT * FROM customer WHERE id=?`
	).get(customerID)
	
}

// Get all customers
function getCustomerByFullName(fullName) {
	
	return db.prepare(
		`SELECT * FROM customer WHERE full_name=?`
	).get(fullName)
	
}

// Get sales records for a customer
function getSalesRecordsByCustomerID(customerID) {
	
	return db.prepare(
		`SELECT * FROM sales_record WHERE customer_id=?`
	).all(customerID)
	
}

// Get all sales records
function getSalesRecords() {
	
	return db.prepare(
		`SELECT * FROM sales_record`
	).all()
	
}

// Get offered services in a sales record
function getOfferedServicesBySalesRecordID(salesRecordID) {
	
	return db.prepare(
		`SELECT * FROM offered_service WHERE sales_record_id=?`
	).all(salesRecordID)
	
}

// Get a service using service ID
function getServiceByID(serviceID) {
	
	return db.prepare(
		`SELECT * FROM service WHERE id=?`
	).get(serviceID)
	
}

// Get customers based on search parameters
function getCustomersBySearch(searchParameters) {
	
	var havingClause = ''
	const searchValues = []
	
	function addCondition(condition) {
		havingClause += havingClause ? ' AND ' : ' HAVING '
		havingClause += condition
	}
			
	for (const column in searchParameters) {
		let value = searchParameters[column]
		
		if (!value) {continue}
		
		switch(column) {
			case 'id':
				addCondition('customer.id LIKE ?')
				searchValues.push('%' + value + '%')
				break
			case 'fullName':
				addCondition('full_name LIKE ?')
				searchValues.push('%' + value + '%')
				break
			case 'contact':
				addCondition('contact LIKE ?')
				searchValues.push('%' + value + '%')
				break
			case 'preferredStaffID':
				if (value == 0) {
					addCondition('preferred_staff_id IS NULL')
					break
				}
				addCondition('preferred_staff_id=?')
				searchValues.push(value)
				break
			case 'dateRegisteredFrom':
				addCondition('date_registered>=?')
				value = new Date(value + ' ')
				searchValues.push(value.toJSON())
				break
			case 'dateRegisteredTo':
				addCondition('date_registered<?')
				value = new Date(value + ' ')
				value.setDate(value.getDate() + 1)
				searchValues.push(value.toJSON())
				break
			case 'lastServiceFrom':
				addCondition('last_service>=?')
				value = new Date(value + ' ')
				searchValues.push(value.toJSON())
				break
			case 'lastServiceTo':
				addCondition('last_service<?')
				value = new Date(value + ' ')
				value.setDate(value.getDate() + 1)
				searchValues.push(value.toJSON())
				break
		}
	}
	
	return db.prepare(
		`SELECT customer.*, max(sales_record.date) as last_service
		FROM customer LEFT OUTER JOIN sales_record
		ON customer.id=sales_record.customer_id
		GROUP BY customer.id
		${havingClause}`
	).all(...searchValues)
	
}

// Create service
function createService(name, defaultPrice) {
	
	return db.prepare(
		`INSERT INTO service (
			name,
			default_price
		) VALUES (?, ?)`
	).run(
		name,
		defaultPrice
	);
	
}

// Create sales record
function createSalesRecord(servicingStaffID, customerID, payment) {
	
	return db.prepare(
		`INSERT INTO sales_record (
			servicing_staff_id,
			customer_id,
			total_price,
			payment,
			change,
			date
		) VALUES (?, ?, ?, ?, ?, ?)`
	).run(
		servicingStaffID,
		customerID,
		0,
		payment,
		payment,
		(new Date()).toJSON()
	);
	
}

// Update sales record values (price and change)
function updateSalesRecord(salesRecordID) {
	
	return db.prepare(
		`UPDATE sales_record
		SET total_price=(
				SELECT sum(price) FROM offered_service WHERE sales_record_id=?),
			change=(
				SELECT sum(price) FROM offered_service WHERE sales_record_id=?) - payment
		WHERE id=?`
	).run(
		salesRecordID,
		salesRecordID,
		salesRecordID
	);
	
}

// Create an offered service in a sales record
function createOfferedService(salesRecordID, serviceID, price) {
	
	const result = db.prepare(
		`INSERT INTO offered_service (
			sales_record_id,
			service_id,
			price
		) VALUES (?, ?, ?)`
	).run(
		salesRecordID,
		serviceID,
		price
	);
	
	updateSalesRecord(salesRecordID)
	
	return result
	
}

// Get offered services offered to a specific customer
function getOfferedServicesByCustomerID(customerID) {
	
	return db.prepare(
		`SELECT *
		FROM sales_record
		INNER JOIN offered_service
			ON sales_record.id = sales_record_id
		INNER JOIN service
			ON service.id = service_id
		WHERE customer_id=?
		`
	).all(customerID);
	
}

// Create a user action
function createUserAction(userID, action) {
	
	return db.prepare(
		`INSERT INTO user_action (
			user_id,
			action,
			date
		) VALUES (?, ?, ?)`
	).run(
		userID,
		action,
		(new Date()).toJSON()
	);
	
}

// Edit customer information
function editCustomer(customerID, preferredStaffID, fullName, contact) {
	
	return db.prepare(
		`UPDATE customer
		SET preferred_staff_id=?,
			full_name=?,
			contact=?
		WHERE id=?`
	).run(
		preferredStaffID,
		fullName,
		contact,
		customerID
	);
	
}

// Get all user actions
function getUserActions() {
	return db.prepare(
		`SELECT * FROM user_action`
	).all()
}

module.exports = {
	open,
	close,
	initialize,
	createUser,
	getUsers,
	getUserByID,
	getUserByUsername,
	createSecurityQuestion,
	getSecurityQuestions,
	setUserPassword,
	createCustomer,
	getCustomers,
	getCustomerByID,
	getCustomerByFullName,
	getSalesRecordsByCustomerID,
	getOfferedServicesBySalesRecordID,
	getServiceByID,
	getCustomersBySearch,
	createService,
	createSalesRecord,
	updateSalesRecord,
	createOfferedService,
	getOfferedServicesByCustomerID,
	createUserAction,
	editCustomer,
	getSalesRecords,
	getUserActions
}