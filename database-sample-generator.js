function createSampleData(database) {
	
	const customerNames = [
		'Kristan Jay Sebastian',
		'Marx Gabriel Dela Cruz',
		'Lui Andrei Reyes',
		'Deinielle Anjhelo Santiago',
		'Bianca Louise Del Mundo',
		'Dingdong Dantes',
		'Piolo Pascual',
		'Paulo Avelino',
		'Richard Gutierrez',
		'Dennis Trillo',
		'Jericho Rosales',
		'Marian Rivera',
		'Andrea Brillantes',
		'Anne Curtis',
		'Angel Locsin',
		'Nadine Lustre',
		'Katryn Bernardo',
		'Francine Diaz',
		'Maja Salvador',
		'Arci Munoz',
		'Kim Chiu',
		'Jane Oineza',
		'Loisa Andalio',
		'Alex Gonzaga',
		'Alexa Ilacad',
		'Erich Gonzales',
		'Bea Alonzo',
		'Sharlene San Pedro',
		'Mona Alawi',
		'Jillian Ward',
		'Belle Mariano',
		'Donny Pangilinan',
		'Xyriel Manabat',
		'Janine Gutierrez',
		'Zanjoe Marudo',
		'Seth Fedelin',
		'John Arcilla',
		'Barbara Miguel',
		'John Carlo Santos',
		'Christian Bables'
	]

	const customerIDs = {}

	const users = [
		['tmvelasquez', 'velasquez123', 'admin', 'Trisha Mae Velasquez'],
		['crpoblacion', 'lab123', 'staff', 'Carlo Raniel Poblacion'],
		['jcdomingo', 'domingo123', 'staff', 'Jeremy Charles Domingo']
	]

	const servicedCustomers = {}
	
	const securityQuestions = {
		1: [
			'Where did you go on your favorite vacation as a child?',
			'Pasig River'
		],
		2: [
			'What is the radius of a circle that circumscribes your favorite right triangle?',
			'5cm'
		],
		3: [
			'Who is your first love?',
			'Raihzza'
		]
	}

	const services = [
		['Haircut / Shampoo', 200],
		['Blow Dry / Ironing', 500],
		['Hair Oil / Hair Spa', 800],
		['Hair Perming', 500],
		['Hair & Make-up', 400],
		['Hair Dye / Highlights / Cellophane & Make-up', 800],
		['Hair Relax / Rebond / Straightening', 700],
		// ['Facial / Diamond Peel', 800],
		// ['Wart Removal', 1500],
		// ['Eyebrow Shave / Threading', 1000],
		// ['Eyelash Perm / Extension', 2000],
		// ['Body Scrub / Body Massage', 750],
		// ['Xiamen Foot Massage', 500],
		['Hand & Foot Spa / Manicure & Pedicure', 600],
		['Hand & Foot Paraffin', 2000],
		['Waxing - Armpit / Legs', 500],
		['Goods', 0]
	]

	const inventoryItems = [
		['Hair Dye', 'GLAMWORKS', 'box', 30, 500],
		['Smooth & Manageable Shampoo', 'Sunsilk', '1L bottle', 10, 347],
		['Alcohol', 'FAMILY', '473ml bottle', 15, 78.56],
		['Bleaching Soap', 'RDL', '135g box', 5, 73],
		['Cuticle Remover', 'Jackie', '60ml bottle', 36, 5],
		['Acetone', 'Jackie', '60ml bottle', 36, 10]
	]

	const serviceItems = {
		'Haircut / Shampoo': [1],
		'Hair Dye / Highlights / Cellophane & Make-up': [2],
		'Hand & Foot Spa / Manicure & Pedicure': [2, 4, 5],
	}

	var currentUser
	var currentDate = new Date('2024-05-01')

	function randomNo() {
		return '09' + Math.floor(999999999 * Math.random()).toString().padStart(9, '0')
	}

	function addDays(n) {
		if (currentUser) {
			simulateLogout()
		}
		currentDate.setDate(currentDate.getDate() + n)
		currentDate.setHours(8)
		addMinutes(r(0, 30))
	}

	// Generate random number between a and b
	function r(a, b) {
		if (a === undefined) {
			a = 0
		}
		if (b === undefined) {
			b = a + 1
		}
		return a + Math.random()*(b-a)
	}

	// Generate random integer between a and b
	function ri(a, b) {
		if (a === undefined) {
			a = 0
		}
		if (b === undefined) {
			b = a + 1
		}
		b++
		return Math.floor(r(a, b))
	}

	function addMinutes(n) {
		currentDate.setMilliseconds(currentDate.getMilliseconds() + n*60000)
	}

	function simulate(user, action, args) {
		if (user !== currentUser) {
			simulateLogout()
			addMinutes(r(5, 10))
		}
		
		if (!currentUser) {
			simulateLogin(user)
			addMinutes(r(0, 0.2))
		}
		
		if (action === 'User Registration') {
			simulateUserRegistration(...args)
		}
		
		if (action === 'Customer Registration') {
			simulateCustomerRegistration(...args)
		}
		
		if (action === 'Inventory Record Creation') {
			simulateInventoryRecordCreation(...args)
		}
		
		if (action === 'Sales Record Creation') {
			simulateSalesRecordCreation(...args)
		}
	}



	function simulateLogin(user) {
		addMinutes(r())
		currentUser = user
		database.createUserAction(currentUser, 'Logged In', currentDate)
	}

	function simulateLogout() {
		if (!currentUser) {
			return
		}
		addMinutes(r())
		database.createUserAction(currentUser, 'Logged Out', currentDate)
		currentUser = undefined
	}

	function simulateUserRegistration() {
		addMinutes(r(0.5))
		const userID = database.createUser(...arguments).lastInsertRowid
		database.createSecurityQuestion(userID, ...securityQuestions[userID])
		database.createUserAction(currentUser, 'Registered user ' + userID, currentDate)
	}

	function simulateCustomerRegistration(customerName) {
		addMinutes(r(1))
		const customerID = database.createCustomer(currentUser, customerName, randomNo(), currentDate).lastInsertRowid
		customerIDs[customerName] = customerID
		database.createUserAction(currentUser, 'Registered customer ' + customerID, currentDate)
		return customerID
	}

	function simulateSalesRecordCreation(customerName, offeredServices) {
		var customerID
		if (customerName) {
			customerID = customerIDs[customerName]
			if (!customerID) {
				customerID = simulateCustomerRegistration(customerName)
			}
			if (!servicedCustomers[currentUser]) {
				servicedCustomers[currentUser] = []
			}
			servicedCustomers[currentUser].push(customerName)
		}
		
		
		var totalPrice = offeredServices.reduce(
			(accumulator, offeredService) => accumulator + offeredService[1],
			0
		)
		
		if (ri()) {
			totalPrice = Math.ceil(totalPrice/500)*500
		}
		
		addMinutes(r(0.5, 3))
		const salesRecordID = database.createSalesRecord(currentUser, customerID, totalPrice, currentDate).lastInsertRowid
		for (const offeredService of offeredServices) {
			database.createOfferedService(salesRecordID, ...offeredService)
		}
		database.createUserAction(currentUser, 'Created sales record ' + salesRecordID, currentDate)
	}

	function simulateInventoryRecordCreation() {
		addMinutes(r(1, 3))
		const salesRecordID = database.createInventoryRecord(currentUser, ...arguments)
		database.createUserAction(currentUser, 'Created inventory record ' + salesRecordID, currentDate)
	}





	/* 
	==============================
		Generation starts here
	==============================
	*/

	console.log('...Generating Database')
	
	addMinutes(r(30, 240))
	database.createUserAction(1, 'Logged In', currentDate)
	
	addMinutes(r(0))
	database.setUser(1, ...users[0])
	database.createSecurityQuestion(1, ...securityQuestions[1])
	database.createUserAction(1, 'Edited user 1', currentDate)
	
	var i, j, k, l, m
	
	for (i = 1; i < users.length; i++) {
		simulate(1, 'User Registration', users[i])
	}
	
	addMinutes(r(10, 20))
	for (const service of services) {
		database.createService(...service)
	}
	database.createUserAction(currentUser, 'Edited services', currentDate)
	
	addDays(1)
	
	for (i = 0; i < inventoryItems.length; i++) {
		addDays(ri(0, 1))
		addMinutes(r(30, 60))
		
		simulate(
			1,
			'Inventory Record Creation',
			inventoryItems[i]
		)
	}
	
	addDays(7)
	
	for (i = 0; i < 60; i++) {
		
		for (j = 0; j < 20; j += ri(1, 20)) {
			addMinutes(r(15, 360))
			
			const userID = ri(1, users.length)
			
			const lostItems = []
			
			const offeredServices = []
			l = ri(1, 3)
			for (k = 0; k < l; k++) {
				m = ri(0, services.length-1)
				const service = services[m]
				const consumableItems = serviceItems[service[0]]
				if (consumableItems && r() > 0.75) {
					lostItems.push(
						consumableItems[ri(0, consumableItems.length-1)]
					)
				}
				offeredServices.push([
					m+1,
					service[1] + m === 0 ? 0 : ri(1,4)*100
				])
			}
			
			var customerName
		
			const preferredCustomers = servicedCustomers[userID]
			if (preferredCustomers && r() > 0.7) {
				customerName = preferredCustomers[ri(0, preferredCustomers.length - 1)]
			} else {
				// (intended to return undefined)
				customerName = customerNames[ri(0, customerNames.length*2 - 1)]
			}
		
			simulate(
				userID,
				'Sales Record Creation',
				[customerName, offeredServices]
			)
			
			for	(const lostItem of lostItems) {
				addMinutes(r(0.5, 2))
				simulate(
					1,
					'Inventory Record Creation',
					[...inventoryItems[lostItem].slice(0, 3), -1]
				)
			}
			
			simulateLogout()
		}
		
		addDays(1)
	}
}


module.exports = createSampleData