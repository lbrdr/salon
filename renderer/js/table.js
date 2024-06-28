var tableCount = 0

function createColoredSpan(value, text) {
	if (!text) {text = Number(value)}
	const span = document.createElement('span')
	span.style.color = value < 0 ? 'var(--red)' : value > 0 ? 'var(--green)' : ''
	span.style.fontWeight = 'bold'
	span.innerText = text
	return span
}
	
function createErrorSpan() {
	const span = document.createElement('span')
	span.style.color = 'var(--red)'
	span.style.fontWeight = 'bold'
	span.innerText = 'Error'
	return span
}

function createTable(parent, columns, data, options) {
	
	const tableObj = {}
	
	tableObj.name = 'table' + (tableCount++)
	tableObj.columns = columns
	tableObj.data = data
	for (const option in options) {
		tableObj[option] = options[option]
	}
	tableObj.setData = setData
	tableObj.setPage = setPage
	tableObj.setItemsPerPage = setItemsPerPage
	tableObj.setSelected = setSelected
	
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
	prevButton.onclick = () => {setPage(tableObj.page - 1)}
	
	const pageDisplay = document.createElement('div')
	
	const nextButton = document.createElement('input')
	nextButton.type = 'button'
	nextButton.className = 'button5'
	nextButton.value = '>'
	nextButton.onclick = () => {setPage(tableObj.page + 1)}
	
	const lastButton = document.createElement('input')
	lastButton.type = 'button'
	lastButton.className = 'button5'
	lastButton.value = '>|'
	lastButton.onclick = () => {setPage(tableObj.lastPage)}
	
	controls.append(firstButton)
	controls.append(prevButton)
	controls.append(pageDisplay)
	controls.append(nextButton)
	controls.append(lastButton)
	
	setItemsPerPage(tableObj.itemsPerPage)
	
	return tableObj
	
	
	
	function setData(data) {
		tableObj.data = data
		setItemsPerPage(tableObj.itemsPerPage)
		
		const selected = tableObj.selected
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
		
		if (tableObj.itemsPerPage) {
			
			if (page < 1) {
				page = 1
			}
			if (page > tableObj.lastPage) {
				page = tableObj.lastPage
			}
			if (page <= 1) {
				firstButton.disabled = true
				prevButton.disabled = true
			} else {
				firstButton.disabled = false
				prevButton.disabled = false
			}
			if (page >= tableObj.lastPage) {
				nextButton.disabled = true
				lastButton.disabled = true
			} else {
				nextButton.disabled = false
				lastButton.disabled = false
			}
			
			pageDisplay.innerText = 'Showing page ' + page + ' of ' + tableObj.lastPage
			
		}
		
		tableObj.page = page
		
		tableHTML = createTableHTML(tableObj)
		
		if (tableObj.html) {
			tableObj.html.remove()
		}
		
		parent.prepend(tableHTML)
		
		tableObj.html = tableHTML

	}
	
	function setItemsPerPage(itemsPerPage) {
		
		var nextPage
		
		if (itemsPerPage) {
			parent.append(controls)
			if (tableObj.page) {
				nextPage = Math.ceil(((tableObj.page-1) * tableObj.itemsPerPage + 1) / itemsPerPage)
			} else {
				nextPage = 1
			}
			tableObj.itemsPerPage = itemsPerPage
			tableObj.lastPage = Math.ceil(tableObj.data.length / itemsPerPage)
			setPage(nextPage)
		} else {
			controls.remove()
			tableObj.itemsPerPage = undefined
			tableObj.page = undefined
			tableObj.lastPage = undefined
			setPage()
		}
		
	}
	
	function setSelected(item) {
		if (item) {
			
			const index = tableObj.data.indexOf(item)
			
			if (index < 0) {
				
				item = undefined
				
			} else {
				
				const itemsPerPage = tableObj.itemsPerPage
				let tr
				if (itemsPerPage) {
					setPage(Math.ceil((index + 1)/ itemsPerPage))
				}
				
				const allTR = tableObj.html.getElementsByTagName('tr')
				
				if (itemsPerPage) {
					tr = allTR[index % itemsPerPage + 1]
				} else {
					tr = allTR[index + 1]
				}
				
				for (const eachTR of allTR) {
					eachTR.className = eachTR.className.replace(/ ?selected/, '')
				}
				tr.className += ' selected'
				
				const radio = tr.children[0].children[0]
				radio.checked = true
				
				tr.scrollIntoViewIfNeeded()
				
			}
		}
		
		tableObj.selected = item
		
	}
}

function createTableHTML(tableObj) {
	
	var {
		columns,
		data,
		itemsPerPage,
		page,
		name,
		select,
		minRows,
		setSelected
	} = tableObj
	
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
		
		tHead.append(tr)
	}
	
	for (var i = 0; i < data.length; i++) {
		const item = data[i]
		const tr = document.createElement('tr')
		
		if (item.highlight) {
			tr.className += ' highlight'
		}
		
		if (item.error) {
			tr.className += ' error'
		}
		
		if (select) {
			const td = document.createElement('td')
			td.className = 'input-td'
			
			const radio = document.createElement('input')
			radio.type = 'radio'
			radio.name = name + '-radio'
			
			tr.onclick = (event) => {
				setSelected(item)
		
				if (typeof select === 'function') {
					select(item)
				}
			}
			
			if (tableObj.selected && tableObj.selected === item) {
				radio.checked = true
				tr.className += ' selected'
			}
			
			td.append(radio)
			tr.append(td)
		}
		
		for (const column in columns) {
			const td = document.createElement('td')
			const data = item[column]
			
			if (data === null) {
				
				td.innerText = '-'
				
			} else if (data instanceof Node) {
				
				if (data.innerText && !isNaN(data.innerText)) {
					td.className = 'number-td'
				}
				
				td.append(data.cloneNode(true))
				
			} else if (typeof data === 'function') {
				
				td.className = 'input-td'
				
				const button = document.createElement('input')
				button.type = 'button'
				button.className = 'button5'
				button.value = 'View'
				button.onclick = (event) => {
					data(item)
					event.stopPropagation()
				}
				
				td.append(button)
				
			} else if (typeof data === 'object') {
				
				td.className = 'input-td'
				
				const button = document.createElement('input')
				button.type = 'button'
				button.className = 'button5'
				button.value = data.value
				button.onclick = data.onclick
				
				td.append(button)
				
			} else {
				
				if (!isNaN(data)) {
					td.className = 'number-td'
				}
				
				// if (typeof data === 'number') {
					// td.className = 'number-td'
				// }
				
				td.innerText = data || data === 0 ? data : '-'
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