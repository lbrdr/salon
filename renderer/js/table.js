var tableCount = 0

function createTable(parent, columns, data, options) {
	
	const tableData = {}
	
	tableData.name = 'table' + (tableCount++)
	tableData.columns = columns
	tableData.data = data
	for (const option in options) {
		tableData[option] = options[option]
	}
	tableData.setData = setData
	tableData.setPage = setPage
	tableData.setItemsPerPage = setItemsPerPage
	tableData.setSelected = setSelected
	
	const controls = document.createElement('div')
	controls.className = 'table-controls'
	
	const firstButton = document.createElement('input')
	firstButton.type = 'button'
	firstButton.className = 'button5'
	firstButton.value = '|<'
	firstButton.onclick = () => {setPage(1)}
	
	const prevButton = document.createElement('input')
	prevButton.type = 'button'
	prevButton.className = 'button5'
	prevButton.value = '<'
	prevButton.onclick = () => {setPage(tableData.page - 1)}
	
	const pageDisplay = document.createElement('div')
	
	const nextButton = document.createElement('input')
	nextButton.type = 'button'
	nextButton.className = 'button5'
	nextButton.value = '>'
	nextButton.onclick = () => {setPage(tableData.page + 1)}
	
	const lastButton = document.createElement('input')
	lastButton.type = 'button'
	lastButton.className = 'button5'
	lastButton.value = '>|'
	lastButton.onclick = () => {setPage(tableData.lastPage)}
	
	controls.append(firstButton)
	controls.append(prevButton)
	controls.append(pageDisplay)
	controls.append(nextButton)
	controls.append(lastButton)
	
	setItemsPerPage(tableData.itemsPerPage)
	
	return tableData
	
	
	
	function setData(data) {
		tableData.data = data
		setItemsPerPage(tableData.itemsPerPage)
		
		const selected = tableData.selected
		if (selected && selected.id !== undefined) {			
			setSelected(
				data.find(
					(item) => item.id === selected.id
				)
			);
		}
	}
		
		
	function setPage(page) {
		var tableHTML
		
		if (tableData.itemsPerPage) {
			
			if (page < 1) {
				page = 1
			}
			if (page > tableData.lastPage) {
				page = tableData.lastPage
			}
			if (page <= 1) {
				firstButton.disabled = true
				prevButton.disabled = true
			} else {
				firstButton.disabled = false
				prevButton.disabled = false
			}
			if (page >= tableData.lastPage) {
				nextButton.disabled = true
				lastButton.disabled = true
			} else {
				nextButton.disabled = false
				lastButton.disabled = false
			}
			
			pageDisplay.innerText = 'Showing page ' + page + ' of ' + tableData.lastPage
			
		}
		
		tableData.page = page
		
		tableHTML = createTableHTML(tableData)
		
		if (tableData.html) {
			tableData.html.remove()
		}
		
		parent.prepend(tableHTML)
		
		tableData.html = tableHTML

	}
	
	function setItemsPerPage(itemsPerPage) {
		
		var nextPage
		
		if (itemsPerPage) {
			parent.append(controls)
			if (tableData.page) {
				nextPage = Math.ceil(((tableData.page-1) * tableData.itemsPerPage + 1) / itemsPerPage)
			} else {
				nextPage = 1
			}
			tableData.itemsPerPage = itemsPerPage
			tableData.lastPage = Math.ceil(tableData.data.length / itemsPerPage)
			setPage(nextPage)
		} else {
			controls.remove()
			tableData.itemsPerPage = undefined
			tableData.page = undefined
			tableData.lastPage = undefined
			setPage()
		}
		
	}
	
	function setSelected(item) {
		console.log('setSelected:')
		console.log(item)
		
		if (item) {
			const index = tableData.data.indexOf(item)
			
			if (index < 0) {
				
				item = undefined
				
			} else {
				
				const itemsPerPage = tableData.itemsPerPage
				let tr
				if (itemsPerPage) {
					setPage(Math.ceil((index + 1)/ itemsPerPage))
					const allTR = tableData.html.getElementsByTagName('tr')
					tr = allTR[index % itemsPerPage + 1]
				} else {
					const allTR = tableData.html.getElementsByTagName('tr')
					for (const eachTR of allTR) {
						eachTR.className = ''
					}
					tr = allTR[index + 1]
				}
				
				const radio = tr.children[0].children[0]
				
				radio.checked = true
				tr.className = 'selected'
				
			}
		}
		
		const select = tableData.select
		
		tableData.selected = item
		
		if (typeof select === 'function') {
			select(item)
		}
	}
}

function createTableHTML(tableData) {
	
	var {
		columns,
		data,
		itemsPerPage,
		page,
		name,
		select,
		view,
		minRows
	} = tableData
	
	if (itemsPerPage) {
		data = data.slice(
			(page-1) * itemsPerPage,
			(page) * itemsPerPage
		)
	}
	
	const container = document.createElement('div')
	container.className = 'table-container'
	
	const table = document.createElement('table')
	if (select) {
		table.className = 'selectable'
	}
	
	const tHead = document.createElement('thead')
	const tBody = document.createElement('tbody')
	
	{
		const tr = document.createElement('tr')
		
		if (select) {
			const td = document.createElement('th')
			td.innerText = 'Select'
			tr.append(td)
		}
		
		for (const column in columns) {
			const td = document.createElement('th')
			td.innerText = columns[column]
			tr.append(td)
		}
		
		if (view) {
			const td = document.createElement('th')
			td.innerText = 'View'
			tr.append(td)
		}
		
		tHead.append(tr)
	}
	
	for (var i = 0; i < data.length; i++) {
		const item = data[i]
		const tr = document.createElement('tr')
		
		if (select) {
			const td = document.createElement('td')
			const radio = document.createElement('input')
			radio.type = 'radio'
			radio.name = name + '-radio'
			
			tr.onclick = (event) => {
				radio.checked = true
				for (const eachTR of tBody.getElementsByTagName('tr')) {
					eachTR.className = ''
				}
				tr.className = 'selected'
				tableData.selected = item
				if (typeof select === 'function') {
					select(item)
				}
			}
			
			if (tableData.selected && tableData.selected === item) {
				radio.checked = true
				tr.className = 'selected'
			}
			
			td.append(radio)
			tr.append(td)
		}
		
		for (const column in columns) {
			const td = document.createElement('td')
			const data = item[column]
		
			if (typeof data === 'function') {
				
				const button = document.createElement('input')
				button.type = 'button'
				button.className = 'button5'
				button.value = 'View'
				button.onclick = (event) => {
					data(item)
					event.stopPropagation()
				}
				
				td.append(button)
				
			} else {
				
				td.innerText = data || '-'
				
			}
			
			tr.append(td)
		}
		
		tBody.append(tr)
	}
	
	for (; i < (itemsPerPage || minRows); i++) {
		const tr = document.createElement('tr')
		if (select) {
			const td = document.createElement('td')
			td.innerText = '-'
			tr.append(td)
		}
		for (const column in columns) {
			const td = document.createElement('td')
			td.innerText = '-'
			tr.append(td)
		}
		tBody.append(tr)
	}
	
	table.append(tHead)
	table.append(tBody)
	container.append(table)
	
	return container
}