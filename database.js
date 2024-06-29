const path = require('path')
const fs = require('fs')
const sqlite3 = require('better-sqlite3')

const createSampleData = require('./database-sample-generator.js')

const database = {
	initialize,
	createUser,
	setUser,
	getUsers,
	getUserByID,
	getUserByUsername,
	createSecurityQuestion,
	setSecurityQuestion,
	getSecurityQuestionsByUserID,
	getEmptySecurityQuestions,
	setUserPassword,
	createCustomer,
	getCustomers,
	getCustomerByID,
	getCustomerByFullName,
	getSalesRecordsByCustomerID,
	getOfferedServicesBySalesRecordID,
	getServices,
	getServiceByID,
	getOfferedServiceByID,
	getCustomersBySearch,
	createService,
	createSalesRecord,
	updateSalesRecord,
	createOfferedService,
	getOfferedServicesByCustomerID,
	createUserAction,
	setCustomer,
	getSalesRecords,
	getUserActions,
	getSalesRecordByID,
	setSalesRecord,
	voidOfferedServicesBySalesRecordID,
	getInventoryItem,
	getInventoryItems,
	getInventoryRecordByID,
	getInventoryRecords,
	getInventoryRecordsByItem,
	createInventoryRecord,
	setInventoryRecord,
	getCustomerMetrics,
	getSalesMetrics,
	getInventoryMetrics,
	getUserLogs,
	setService,
	backupData,
	restoreData
}

function formatDate(date, modifier) {
	date = date ?
		new Date(date + ' ') :
		new Date()
		
	if (modifier) {
		modifier(date)
	}
		
	return date.toJSON()
}

function formatDateTime(dateTime, modifier) {
	dateTime = dateTime ?
		new Date(dateTime) :
		new Date()
		
	if (modifier) {
		modifier(dateTime)
	}
	
	return dateTime.toJSON()
}

const dbFile = 'main.db'
const dbFolder = path.resolve(__dirname, 'database')
const dbPath = path.resolve(dbFolder, dbFile)
const options = {}
var db



// Create backup of main db file if it exists
// Create db file if it does not exist
var newDb
try {
	fs.accessSync(dbPath, fs.constants.F_OK)
	db = sqlite3(dbPath, options)
} catch (err) {
	fs.writeFileSync(dbPath, '')
	db = sqlite3(dbPath, options)
	newDb = true
}

initialize(db)
if (newDb) {
	createUser('admin', 'default123', 'admin', 'Default Admin Account')
	createSampleData(database)
}



// Initialize tables
function initialize(db) {
	
	db.prepare(
		`CREATE TABLE IF NOT EXISTS user (
			id INTEGER PRIMARY KEY,
			username TEXT UNIQUE NOT NULL,
			password TEXT NOT NULL,
			user_type TEXT NOT NULL,
			full_name TEXT NOT NULL,
			disabled INTEGER
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS security_question (
			id INTEGER PRIMARY KEY,
			user_id INTEGER,
			question TEXT,
			answer TEXT,
			FOREIGN KEY(user_id) REFERENCES user(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS user_action (
			id INTEGER PRIMARY KEY,
			user_id INTEGER NOT NULL,
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
		`CREATE TABLE IF NOT EXISTS sales_record (
			id INTEGER PRIMARY KEY ASC,
			servicing_staff_id INTEGER NOT NULL,
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
			default_price REAL NOT NULL,
			unavailable INTEGER
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS offered_service (
			id INTEGER PRIMARY KEY ASC,
			sales_record_id INTEGER NOT NULL,
			service_id INTEGER NOT NULL,
			price REAL NOT NULL,
			void INTEGER,
			FOREIGN KEY(sales_record_id) REFERENCES sales_record(id),
			FOREIGN KEY(service_id) REFERENCES service(id)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS inventory_item (
			name TEXT NOT NULL,
			manufacturer TEXT NOT NULL,
			unit TEXT NOT NULL,
			current_stock REAL,
			last_record_date TEXT,
			status TEXT,
			void INTEGER,
			PRIMARY KEY(name, manufacturer, unit)
		)`
	).run();
	db.prepare(
		`CREATE TABLE IF NOT EXISTS inventory_record (
			id INTEGER PRIMARY KEY ASC,
			recording_staff_id INTEGER NOT NULL,
			item_name TEXT NOT NULL,
			item_manufacturer TEXT NOT NULL,
			item_unit TEXT NOT NULL,
			amount REAL NOT NULL,
			unit_cost REAL,
			date TEXT NOT NULL,
			FOREIGN KEY(recording_staff_id) REFERENCES user(id)
			FOREIGN KEY(item_name, item_manufacturer, item_unit) REFERENCES inventory_item(name, manufacturer, unit)
		)`
	).run();
	
}




// Create inventory record
function createInventoryRecord(
	recordingStaffID,
	itemName,
	itemManufacturer,
	itemUnit,
	amount,
	unitCost,
	date
) {
	
	createInventoryItem(
		itemName,
		itemManufacturer,
		itemUnit
	)
	
	const result = db.prepare(
		`INSERT INTO inventory_record (
			recording_staff_id,
			item_name,
			item_manufacturer,
			item_unit,
			amount,
			unit_cost,
			date
		) VALUES (?, ?, ?, ?, ?, ?, ?)
		`
	).run(
		recordingStaffID,
		itemName,
		itemManufacturer,
		itemUnit,
		amount,
		unitCost,
		formatDateTime(date)
	)
	
	updateInventoryItem(
		itemName,
		itemManufacturer,
		itemUnit
	)
	
	return result
	
}

// Set inventory record info
function setInventoryRecord(
	inventoryRecordID,
	recordingStaffID,
	itemName,
	itemManufacturer,
	itemUnit,
	amount,
	unitCost,
	date
) {
	
	const oldRecord = db.prepare(
		`SELECT * FROM inventory_record	WHERE id=?`
	).get(inventoryRecordID)
	
	const differentItem =
		oldRecord.item_name !== itemName ||
		oldRecord.item_manufacturer !== itemManufacturer ||
		oldRecord.item_unit !== itemUnit
	
	if (differentItem) {	
		createInventoryItem(
			itemName,
			itemManufacturer,
			itemUnit
		)
	}
	
	const result = db.prepare(
		`UPDATE inventory_record
		SET recording_staff_id=?,
			item_name=?,
			item_manufacturer=?,
			item_unit=?,
			amount=?,
			unit_cost=?,
			date=?
		WHERE id=?
		`
	).run(
		recordingStaffID,
		itemName,
		itemManufacturer,
		itemUnit,
		amount,
		unitCost,
		formatDateTime(date),
		inventoryRecordID
	)
	
	if (differentItem) {
		updateInventoryItem(
			oldRecord.item_name,
			oldRecord.item_manufacturer,
			oldRecord.item_unit
		)
	}
	
	updateInventoryItem(
		itemName,
		itemManufacturer,
		itemUnit
	)
	
	return result
	
}

// Create an inventory item with null values for current stock, status, etc.
function createInventoryItem(name, manufacturer, unit) {
	
	return db.prepare(
		`INSERT OR IGNORE INTO inventory_item (
			name,
			manufacturer,
			unit
		) VALUES (?, ?, ?)`
	).run(
		name,
		manufacturer,
		unit
	)
	
}

// Update an inventory item current stock, status, etc.
function updateInventoryItem(name, manufacturer, unit) {
	
	return db.prepare(
		`UPDATE inventory_item
		SET current_stock=
				(SELECT SUM(amount)
					FROM inventory_record
					WHERE item_name=?
					AND item_manufacturer=?
					AND item_unit=?),
			last_record_date=
				(SELECT MAX(date)
					FROM inventory_record
					WHERE item_name=?
					AND item_manufacturer=?
					AND item_unit=?),
			status=
				CASE
					WHEN
						(SELECT SUM(amount)
							FROM inventory_record
							WHERE item_name=?
							AND item_manufacturer=?
							AND item_unit=?)
						> 0
					THEN 'in stock'
					WHEN
						(SELECT SUM(amount)
							FROM inventory_record
							WHERE item_name=?
							AND item_manufacturer=?
							AND item_unit=?)
						< 0
					THEN 'error: negative stock'
					ELSE 'out of stock'
				END,
			void=
				CASE
					WHEN 
						(SELECT COUNT(*)
							FROM inventory_record
							WHERE item_name=?
							AND item_manufacturer=?
							AND item_unit=?)
						> 0
					THEN NULL
					ELSE 1
				END
		WHERE name=?
		AND manufacturer=?
		AND unit=?
		`
	).run(
		name, manufacturer, unit,
		name, manufacturer, unit,
		name, manufacturer, unit,
		name, manufacturer, unit,
		name, manufacturer, unit,
		name, manufacturer, unit
	)
	
}

// Get all inventory records
function getInventoryRecords() {
	
	return db.prepare(
		`SELECT * FROM inventory_record`
	).all()

}

// Get an inventory record by id
function getInventoryRecordByID(inventoryRecordID) {
	
	return db.prepare(
		`SELECT * FROM inventory_record WHERE id=?`
	).get(inventoryRecordID)

}

// Get an inventory record by item details (name, unit)
function getInventoryRecordsByItem(itemName, itemManufacturer, itemUnit) {
	
	return db.prepare(
		`SELECT *
		FROM inventory_record
		WHERE item_name=?
		AND item_manufacturer=?
		AND item_unit=?
		`
	).get(
		itemName,
		itemManufacturer,
		itemUnit
	)

}

// Get all inventory items
function getInventoryItems() {
	
	return db.prepare(
		`SELECT * FROM inventory_item WHERE void IS NULL`
	).all()

}

// Get an inventory item by the name, and unit
function getInventoryItem(name, manufacturer, unit) {
	
	return db.prepare(
		`SELECT *
		FROM inventory_item
		WHERE name=?
		AND manufacturer=?
		AND unit=?
		AND void IS NULL
		`
	).get(
		name,
		manufacturer,
		unit
	)

}



// Create user
function createUser(username, password, userType, fullName, disabled) {
	
	return db.prepare(
		`INSERT INTO user (
			username,
			password,
			user_type,
			full_name,
			disabled
		) VALUES (?, ?, ?, ?, ?)`
	).run(
		username,
		password,
		userType,
		fullName,
		disabled
	);
	
}

// Set user details
function setUser(userID, username, password, userType, fullName, disabled) {
	
	return db.prepare(
		`UPDATE user
		SET username=?,
			password=?,
			user_type=?,
			full_name=?,
			disabled=?
		WHERE id=?
		`
	).run(
		username,
		password,
		userType,
		fullName,
		disabled,
		userID
	)
	
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


// Set security questions details
function setSecurityQuestion(securityQuestionID, userID, question, answer) {
	
	return db.prepare(
		`UPDATE security_question
		SET user_id=?,
			question=?,
			answer=?
		WHERE id=?
		`
	).run(
		userID,
		question,
		answer,
		securityQuestionID
	);
	
}

// Get security questions by user id
function getSecurityQuestionsByUserID(userID) {
	
	return db.prepare(
		`SELECT * FROM security_question WHERE user_id=?`
	).all(userID)
	
}

// Get empty user questions
function getEmptySecurityQuestions() {
	
	return db.prepare(
		`SELECT * FROM security_question WHERE user_id IS NULL`
	).all()
	
}

// Set user password by user id
function setUserPassword(userID, password) {
	
	return db.prepare(
		`UPDATE user SET password=? WHERE id=?`
	).run(password, userID)
	
}

// Create customer
function createCustomer(preferredStaffID, fullName, contact, dateRegistered) {
	
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
		formatDateTime(dateRegistered)
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

// Get a customer by their full name
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

// Get sales records for a customer
function getSalesRecordByID(salesRecordID) {
	
	return db.prepare(
		`SELECT * FROM sales_record WHERE id=?`
	).get(salesRecordID)
	
}

// Get all sales records
function getSalesRecords() {
	
	return db.prepare(
		`SELECT * FROM sales_record`
	).all()
	
}

// Get all services
function getServices() {
	
	return db.prepare(
		`SELECT * FROM service`
	).all()
	
}


// Get a service using service ID
function getServiceByID(serviceID) {
	
	return db.prepare(
		`SELECT * FROM service WHERE id=?`
	).get(serviceID)
	
}

// Get customers based on search parameters
function getCustomersBySearch(
	customerID,
	fullName,
	contact,
	preferredStaffID,
	dateRegisteredFrom,
	dateRegisteredTo,
	lastServiceFrom,
	lastServiceTo
) {
	
	var havingClause = ''
	const searchValues = []
	
	function addCondition(condition, value) {
		havingClause += havingClause ? ' AND ' : ' HAVING '
		havingClause += condition
		if (value !== undefined) {
			searchValues.push(value)
		}
	}
	
	if (customerID) {
		addCondition('customer.id LIKE ?', '%' + customerID + '%')
	}
	if (fullName) {
		addCondition('full_name LIKE ?', '%' + fullName + '%')
	}
	if (contact) {
		addCondition('contact LIKE ?', '%' + contact + '%')
	}
	if (preferredStaffID) {
		if (preferredStaffID == 0) {
			addCondition('preferred_staff_id IS NULL')
		} else {
			addCondition('preferred_staff_id=?', preferredStaffID)
		}
	}
	if (dateRegisteredFrom) {
		addCondition('date_registered>=?', dateRegisteredFrom)
	}
	if (dateRegisteredTo) {
		addCondition('date_registered<?', dateRegisteredTo)
	}
	if (lastServiceFrom) {
		addCondition('last_service>=?', lastServiceFrom)
	}
	if (lastServiceTo) {
		addCondition('last_service<?',lastServiceTo)
	}
	
	console.log(havingClause)
	console.log(searchValues)
	
	return db.prepare(
		`SELECT customer.*, max(sales_record.date) as last_service
		FROM customer LEFT OUTER JOIN sales_record
		ON customer.id=sales_record.customer_id
		GROUP BY customer.id
		${havingClause}`
	).all(...searchValues)
	
}

// Create service
function createService(name, defaultPrice, unavailable) {
	
	return db.prepare(
		`INSERT INTO service (
			name,
			default_price,
			unavailable
		) VALUES (?, ?, ?)`
	).run(
		name,
		defaultPrice,
		unavailable ? 1 : null
	);
	
}

// Set service details
function setService(serviceID, name, defaultPrice, unavailable) {
	
	return db.prepare(
		`UPDATE service
		SET name=?,
			default_price=?,
			unavailable=?
		WHERE id=?`
	).run(
		name,
		defaultPrice,
		unavailable ? 1 : null,
		serviceID
	);
	
}

// Create sales record
function createSalesRecord(servicingStaffID, customerID, payment, date) {
	
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
		formatDateTime(date)
	);
	
}

// Update sales record price and change
function updateSalesRecord(salesRecordID) {
	
	return db.prepare(
		`UPDATE sales_record
		SET total_price=(
				SELECT SUM(price) FROM offered_service WHERE sales_record_id=? AND void IS NULL),
			change=payment - (
				SELECT SUM(price) FROM offered_service WHERE sales_record_id=? AND void IS NULL)
		WHERE id=?
		`
	).run(
		salesRecordID,
		salesRecordID,
		salesRecordID
	);
	
}

// Set sales record info
function setSalesRecord(salesRecordID, servicingStaffID, customerID, payment, date) {
	
	return db.prepare(
		`UPDATE sales_record
		SET servicing_staff_id=?,
			customer_id=?,
			payment=?,
			date=?
		WHERE id=?`
	).run(
		servicingStaffID,
		customerID,
		payment,
		formatDateTime(date),
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
			ON sales_record.id=sales_record_id
		INNER JOIN service
			ON service.id=service_id
		WHERE customer_id=? AND offered_service.void IS NULL
		`
	).all(customerID);
	
}

// Get an offered service using offered service ID
function getOfferedServiceByID(offeredServiceID) {
	
	return db.prepare(
		`SELECT * FROM offered_service WHERE id=? AND void IS NULL`
	).get(offeredServiceID)
	
}

// Void offered services using offered service ID
function voidOfferedServicesBySalesRecordID(salesRecordID) {
	
	return db.prepare(
		`UPDATE offered_service 
		SET void=1
		WHERE sales_record_id=? AND void IS NULL`
	).run(salesRecordID)
	
}

// Get offered services in a sales record
function getOfferedServicesBySalesRecordID(salesRecordID) {
	
	return db.prepare(
		`SELECT * FROM offered_service WHERE sales_record_id=? AND void IS NULL`
	).all(salesRecordID)
	
}



// Create a user action
function createUserAction(userID, action, date) {
	
	return db.prepare(
		`INSERT INTO user_action (
			user_id,
			action,
			date
		) VALUES (?, ?, ?)`
	).run(
		userID,
		action,
		formatDateTime(date)
	);
	
}

// Set customer information
function setCustomer(customerID, preferredStaffID, fullName, contact, dateRegistered) {
	
	return db.prepare(
		`UPDATE customer
		SET preferred_staff_id=?,
			full_name=?,
			contact=?,
			date_registered=?
		WHERE id=?`
	).run(
		preferredStaffID,
		fullName,
		contact,
		formatDateTime(dateRegistered),
		customerID
	);
	
}

// Get all user actions
function getUserActions() {
	return db.prepare(
		`SELECT * FROM user_action`
	).all()
}

// Get customer metrics for customer report
function getCustomerMetrics(startDate, endDate, customerType) {
	
	const dateConditions = []
	const dateValues = []

	if (startDate) {
		dateConditions.push('>=?')
		dateValues.push(startDate)
	}
	
	if (endDate) {
		dateConditions.push('<?')
		dateValues.push(endDate)
	}
	
	function filter(clause, column) {
		if (!dateConditions.length) {
			return ''
		}
		const conditions = dateConditions.map((condition) => column + condition)
		return ' ' + clause + ' ' + conditions.join(' AND ')
	}
	
	var summary = []
	var newlyRegisteredCustomers
	var returningCustomers
	var nonReturningCustomers
	
	if (!customerType || customerType === 'newly-registered') {
		
		summary.push(
		
			db.prepare(
				`SELECT
					'non-registered' as classification,
					COUNT(DISTINCT sales_record.id) as records,
					COUNT(offered_service.id) as services
				FROM sales_record
				INNER JOIN offered_service
					ON sales_record.id=offered_service.sales_record_id
				WHERE sales_record.customer_id IS NULL
				${filter('AND', 'sales_record.date')}
				`
			).get(...dateValues),
			
			db.prepare(
				`SELECT
					'newly-registered' as classification,
					COUNT (DISTINCT customer.id) as customers,
					COUNT (DISTINCT sales_record.id) as records,
					COUNT (offered_service.id) as services
				FROM customer
				LEFT OUTER JOIN sales_record
					ON customer.id=sales_record.customer_id
					${filter('AND', 'sales_record.date')}
				LEFT OUTER JOIN offered_service
					ON sales_record.id=offered_service.sales_record_id
				${filter('WHERE', 'customer.date_registered')}
				`
			).get(...dateValues, ...dateValues)
			
		);
		
		newlyRegisteredCustomers = db.prepare(
			`SELECT
				customer.*,
				user.id || ' - ' || user.full_name as preferred_staff,
				COUNT(DISTINCT sales_record.id) as records,
				COUNT(offered_service.id) as services,
				MAX(sales_record.date) as last_record
			FROM customer
			LEFT OUTER JOIN user
				ON customer.preferred_staff_id=user.id
			LEFT OUTER JOIN sales_record
				ON customer.id=sales_record.customer_id
				${filter('AND', 'sales_record.date')} 
			LEFT OUTER JOIN offered_service
				ON sales_record.id=offered_service.sales_record_id
			${filter('WHERE', 'customer.date_registered')}
			GROUP BY customer.id
			`
		).all(...dateValues, ...dateValues)
		
	}
	
	if (!customerType || customerType === 'returning/non-returning') {
		
		summary.push(
			
			db.prepare(
				`SELECT
					'returning' as classification,
					COUNT(DISTINCT customer.id) as customers,
					COUNT(DISTINCT sales_record.id) as records,
					COUNT(offered_service.id) as services
				FROM customer
				INNER JOIN sales_record
					ON customer.id=sales_record.customer_id
				LEFT OUTER JOIN offered_service
					ON sales_record.id=offered_service.sales_record_id
				WHERE customer.date_registered<?
				${filter('AND', 'sales_record.date')}
				`
			).get(startDate, ...dateValues),
			
			db.prepare(
				`SELECT
					'non-returning' as classification,
					COUNT (*) as customers
				FROM customer
				WHERE customer.date_registered<?
				AND NOT EXISTS
					(
						SELECT DISTINCT customer_id
						FROM sales_record
						WHERE customer_id=customer.id
						${filter('AND', 'date')}
					)
				`
			).get(startDate, ...dateValues)
			
		)
		
		returningCustomers = db.prepare(
			`SELECT
				customer.*,
				user.id || ' - ' || user.full_name as preferred_staff,
				COUNT(DISTINCT sales_record.id) as records,
				COUNT(offered_service.id) as services,
				MAX(sales_record.date) as last_record
			FROM customer
			LEFT OUTER JOIN user
				ON customer.preferred_staff_id=user.id
			INNER JOIN sales_record
				ON customer.id=sales_record.customer_id
			LEFT OUTER JOIN offered_service
				ON sales_record.id=offered_service.sales_record_id
			WHERE customer.date_registered<?
			${filter('AND', 'sales_record.date')}
			GROUP BY customer.id
			`
		).all(startDate, ...dateValues)
		
		nonReturningCustomers = db.prepare(
			`SELECT
				customer.*,
				user.id || ' - ' || user.full_name as preferred_staff,
				COUNT(DISTINCT sales_record.id) as records,
				COUNT(offered_service.id) as services,
				MAX(sales_record.date) as last_record
			FROM customer
			LEFT OUTER JOIN user
				ON customer.preferred_staff_id=user.id
			LEFT OUTER JOIN sales_record
				ON customer.id=sales_record.customer_id
				AND sales_record.date<?
			LEFT OUTER JOIN offered_service
				ON sales_record.id=offered_service.sales_record_id
			WHERE customer.date_registered<?
			AND NOT EXISTS
				(
					SELECT DISTINCT customer_id
					FROM sales_record
					WHERE customer_id=customer.id
					${filter('AND', 'date')}
				)
			GROUP BY customer.id
			`
		).all(startDate, startDate, ...dateValues)
		
	}
	
	return { summary, newlyRegisteredCustomers, returningCustomers, nonReturningCustomers }
}

// Get sales metrics for sales report
function getSalesMetrics(startDate, endDate, expenses) {
	
	const dateConditions = []
	const dateValues = []

	if (startDate) {
		dateConditions.push('>=?')
		dateValues.push(startDate)
	}
	
	if (endDate) {
		dateConditions.push('<?')
		dateValues.push(endDate)
	}
	
	function filter(clause, column) {
		if (!dateConditions.length) {
			return ''
		}
		const conditions = dateConditions.map((condition) => column + condition)
		return ' ' + clause + ' ' + conditions.join(' AND ')
	}
	
	const summary = db.prepare(
		`SELECT
			SUM(total_price) AS gross_income,
			? AS expenses,
			SUM(total_price) - ? AS net_income
		FROM sales_record
		${filter('WHERE', 'date')}
		`
	).get(expenses, expenses, ...dateValues)
	
	const salesRecords = db.prepare(
		`SELECT
			sales_record.*,
			customer.id || ' - ' || customer.full_name AS customer,
			user.id || ' - ' || user.full_name AS servicing_staff
		FROM sales_record
		LEFT OUTER JOIN customer
			ON sales_record.customer_id=customer.id
		INNER JOIN user
			ON sales_record.servicing_staff_id=user.id
		${filter('WHERE', 'date')}
		`
	).all(...dateValues)
	
	return { summary, salesRecords }
}

// Get inventory metrics for inventory report
function getInventoryMetrics(startDate, endDate) {
	
	const dateConditions = []
	const dateValues = []

	if (startDate) {
		dateConditions.push('>=?')
		dateValues.push(startDate)
	}
	
	if (endDate) {
		dateConditions.push('<?')
		dateValues.push(endDate)
	}
	
	function filter(clause, column) {
		if (!dateConditions.length) {
			return ''
		}
		const conditions = dateConditions.map((condition) => column + condition)
		return ' ' + clause + ' ' + conditions.join(' AND ')
	}
	
	const totalRestockCost = db.prepare(
		`SELECT SUM(unit_cost*amount) as total_restock_cost
		FROM inventory_record
		${filter('WHERE', 'date')}
		`
	).get(...dateValues).total_restock_cost
	
	const inventoryItems = db.prepare(
		`SELECT
			item_name as name,
			item_manufacturer as manufacturer,
			item_unit as unit,
			SUM(CASE WHEN date<? THEN amount ELSE 0 END) as start_stock,
			SUM(CASE WHEN 1=1 ${filter('AND', 'date')} THEN amount ELSE 0 END) as stock_changes,
			SUM(amount) as end_stock
		FROM inventory_record
		WHERE (?=0 OR date<=?)
		GROUP BY
			item_name,
			item_manufacturer,
			item_unit
		HAVING
			(
				start_stock > 0
				OR (name, manufacturer, unit) IN 
					(
						SELECT name, manufacturer, unit
						FROM inventory_record
						${filter('WHERE', 'date')}
					)
			)
		ORDER BY
			MAX(date) DESC
		`
	).all(startDate, ...dateValues, endDate || 0, endDate, ...dateValues)
	
	const inventoryRecords = db.prepare(
		`SELECT
			inventory_record.*,
			user.id || ' - ' || user.full_name as recording_staff
		FROM inventory_record
		INNER JOIN user
			ON inventory_record.recording_staff_id=user.id
		${filter('WHERE', 'inventory_record.date')}
		`
	).all(...dateValues)
	
	return { inventoryItems, inventoryRecords, totalRestockCost }
}

// Get user logs for user report
function getUserLogs(startDate, endDate, userID) {
	
	const dateConditions = []
	const dateValues = []

	if (startDate) {
		dateConditions.push('>=?')
		dateValues.push(startDate)
	}
	
	if (endDate) {
		dateConditions.push('<?')
		dateValues.push(endDate)
	}
	
	function filter(clause, column) {
		if (!dateConditions.length) {
			return ''
		}
		const conditions = dateConditions.map((condition) => column + condition)
		return ' ' + clause + ' ' + conditions.join(' AND ')
	}
	
	const userLogs = db.prepare(
		`SELECT
			user_action.*,
			user.full_name AS full_name,
			user.username AS username
		FROM user_action
		INNER JOIN user
			ON user_action.user_id=user.id
		WHERE (user.id=? OR 0=?)
		${filter('AND', 'user_action.date')}
		`
	).all(userID, userID || 0, ...dateValues)
	
	return userLogs
}


function backupData() {
	
	db.close()
	
	const buffer = fs.readFileSync(dbPath)
	
	db = sqlite3(dbPath, options)
	
	return buffer

}

var db2
const db2Path = path.resolve(dbFolder, 'temp.db')
var db3
const db3Path = path.resolve(dbFolder, 'temp2.db')

function restoreData(data) {

	function repeat(text, n, separator) {
		return (new Array(n).fill(text)).join(separator)
	}
	
	var m = 0
	
	function generateBackupPath() {
		return path.resolve(
			dbFolder,
			'backup_' +
			(new Date(Date.now() + (m++)))
				.toJSON()
				.replace(/\//g, '-')
				.replace(/:/g, ';') +
			'.db'
		);
	}

	try {
		
		fs.writeFileSync(db3Path, data)
		db3 = sqlite3(db3Path, options)
		
		fs.writeFileSync(db2Path, '')
		db2 = sqlite3(db2Path, options)
		initialize(db2)
		
		if (
			db3.prepare('PRAGMA integrity_check').get()
				.integrity_check !== 'ok'
		) {
			throw 'PRAGMA integrity_check failed'
		}
		
		if (
			db3.prepare('PRAGMA foreign_key_check').all()[0]
		) {
			throw 'PRAGMA foreign_key_check failed'
		}
		
		const tables = db2.prepare(
			`SELECT * FROM sqlite_master where type='table'`
		).all().map((table) => table.tbl_name)
		
		for (const table of tables) {
			
			let tableData
			
			tableData = db3.prepare(
				`SELECT * FROM ${table}`
			).all()
			
			if (tableData && tableData.length) {
				
				const columns = db2.prepare(
					`PRAGMA table_info(${table})`
				).all().map((column) => column.name)
				
				const row = '(' + repeat('?', columns.length, ', ') + ')'
				const rows = repeat(row, tableData.length, ', ')
				const values = [].concat(...tableData.map(
					(entry) => columns.map(
						(column) => entry[column]
					)
				));
				
				db2.prepare(
					`INSERT INTO ${table} (
						${columns.join(', ')}
					) VALUES ${rows}
					`
				).run(...values)
			}
		}
		
		db.close()
		db = undefined
		
		db2.close()
		db2 = undefined
		
		db3.close()
		db3 = undefined
		
		var backupPath
		
		while (true) {
			try {
				backupPath = generateBackupPath()
				fs.accessSync(backupPath, fs.constants.F_OK)
			} catch (err) {
				break
			}
		}
		
		fs.copyFileSync(dbPath, backupPath)
		fs.renameSync(db2Path, dbPath)
		fs.unlinkSync(db3Path)
		
		db = sqlite3(dbPath, options)
		
	} catch (err) {
		
		if (db2) {
			db2.close()
			db2 = undefined
		}
		
		if (db3) {
			db3.close()
			db3 = undefined
		}
		
		try {
			fs.unlinkSync(db2Path)
		} catch (err) {}
		
		try {
			fs.unlinkSync(db3Path)
		} catch (err) {}
		
		if (db === undefined) {
			db = sqlite3(dbPath, options)
		}
		
		throw err
		
		return 'Data could not be restored.'
		
	}
}


module.exports = database