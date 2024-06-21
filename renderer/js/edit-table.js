function createEditTable (parent, columns, options) {
	
	const tableObj = {}
	
	tableObj.columns = columns
	for (const option in options) {
		tableObj[option] = options[option]
	}
	if (tableObj.editable === undefined) {
		tableObj.editable = true
	}
	
	const tableHTML = createEditTableHTML(tableObj)
	tableObj.html = tableHTML
	parent.append(tableHTML)
	
	return tableObj
	
}

function createEditTableHTML(tableObj) {
	
	const {
		columns,
		onchange,
		onadd,
		editable,
		name
	} = tableObj
	
	var columnCount = 1
	
	const container = document.createElement('div')
	container.className = 'table-container'
	
	const table = document.createElement('table')
	const tHead = document.createElement('thead')
	const tBody = document.createElement('tbody')
	
	{
		const tr = document.createElement('tr')
		if (editable) {
			const th = document.createElement('th')
			th.innerText = ''
			tr.append(th)
		}
		for (const column in columns) {
			const th = document.createElement('th')
			th.innerText = column
			tr.append(th)
			columnCount++
		}
		
		tHead.append(tr)
	}
	
	if (editable) {
		const tr = document.createElement('tr')
		const td = document.createElement('td')
		td.colSpan = columnCount
		td.className = 'input-td'
		
		const addButton = document.createElement('div')
		addButton.className = 'button5'
		addButton.onclick = () => {
			createEditTableRow(tableObj)
			if (onadd) {
				onadd()
			}
			if (onchange) {
				onchange()
			}
		}
		
		const addIcon = document.createElement('div')
		addIcon.className = 'icon add-row-icon'
		
		addButton.append(addIcon)
		addButton.append(' Add' + (name ? ' ' + name : ''))
		td.append(addButton)
		tr.append(td)
		tHead.append(tr)
	}
	
	table.append(tHead)
	table.append(tBody)
	container.append(table)
	
	return container
	
}

function createEditTableRow(tableObj) {
	
	const {
		columns,
		onchange,
		onremove,
		editable
	} = tableObj
	
	const table = tableObj.html
	const tHead = table.getElementsByTagName('thead')[0]
	
	const tr = document.createElement('tr')
	
	if (editable) {
		const td = document.createElement('td')
		td.className = 'input-td'
		
		const removeButton = document.createElement('div')
		removeButton.className = 'button5'
		removeButton.onclick = () => {
			tr.remove()
			if (onremove) {
				onremove()
			}
			if (onchange) {
				onchange()
			}
		}
		
		const removeIcon = document.createElement('div')
		removeIcon.className = 'icon remove-row-icon'
		
		removeButton.append(removeIcon)
		removeButton.append(' Remove')
		td.append(removeButton)
		tr.append(td)
	}
	
	for (const column in columns) {
		
		const columnData = columns[column]
		const td = document.createElement('td')
		
		addData(columnData)
		
		function addData(data) {
			
			switch (typeof data) {
				case 'array':
					for (const item in data) {
						addData(item)
					}
					break
				
				case 'function':
					addData(data())
					break
					
				case 'bigint':
				case 'number':
				case 'string':
					td.innerText = data
					break
				
				default:
					if (data instanceof Node) {
						td.append(data)
						break
					}
					td.innerText = '-'
					
			}
		}
		
		tr.append(td)
		
	}
	
	if (editable) {
		tHead.insertBefore(tr, tHead.lastChild)
	} else {
		tHead.append(tr)
	}
	
	return tr
	
}