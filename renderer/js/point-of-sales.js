var posSalesTable
var posSalesData
var posCustomerData
var posStaffData

async function posSetupSalesTable(selectable) {

	const salesRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-sales-records',
			token
		},
	);
	
	{
		const tokenError = await checkToken(salesRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(salesRequest)
		if (permissionError) { return; }
	}
	
	const customerRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-customer-names',
			token
		},
	);
	
	{
		const tokenError = await checkToken(customerRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(customerRequest)
		if (permissionError) { return; }
	}
	
	const staffRequest = await queryRequest(
		'POST',
		{
			action: 'point-of-sales-get-staff-names',
			token
		},
	);
	
	{
		const tokenError = await checkToken(staffRequest)
		if (tokenError) { return; }
		const permissionError = checkPermission(staffRequest)
		if (permissionError) { return; }
	}
	
	
	posSalesData = JSON.parse(salesRequest.responseText)
	posCustomerData = JSON.parse(customerRequest.responseText)
	posStaffData = JSON.parse(staffRequest.responseText)
	
	posSalesData.forEach(
		(record) => {
			
			record.shortDate = (new Date(record.date)).toDateString()
			
			const customer = posCustomerData.find(
				(customer) => customer.id === record.customerID
			)
			
			if (customer) {
				record.customer = customer.id + ' - ' + customer.fullName
			}
			
			const servicingStaff = posStaffData.find(
				(staff) => staff.id === record.servicingStaffID
			)
			
			if (servicingStaff) {
				record.servicingStaff = servicingStaff.id + ' - ' + servicingStaff.fullName
			}
			
			record.services = () => {
				posSalesRecordServices(record)
			}
			
		}
	);
	
	const salesRecords = [...posSalesData]
	salesRecords.sort(
		(a, b) => b.id - a.id
	)
	salesRecords.sort(
		(a, b) => Date.parse(b.date) - Date.parse(a.date)
	)
	
	if (posSalesTable) {
		posSalesTable.setData(salesRecords)
		return
	}
	
	const tableDiv = document.getElementById('sales-table')
	
	posSalesTable = createTable(
		tableDiv,
		{
			id: 'ID',
			customer: 'Customer',
			servicingStaff: 'Servicing Staff',
			preferredStaff: 'Preferred Staff',
			shortDate: 'Date',
			services: 'Services'
		},
		salesRecords,
		{
			itemsPerPage: 7,
			select: true
		}
	)
	
}

function posClearData() {
	posSalesData = undefined
	posCustomerData = undefined
	posStaffData = undefined
	posSalesTable = undefined
}