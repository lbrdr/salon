// Create and show dialogue box
function createMessageDialogue(type, title, message) {
	
	const blockerDiv = document.createElement('div')
	blockerDiv.className = 'blocker'
	blockerDiv.onclick = (event) => blockerDiv.remove()
	
	const dialogueDiv = document.createElement('div')
	dialogueDiv.className = 'message-dialogue-box' + (type ? ' ' + type : '')
	dialogueDiv.onclick = (event) => event.stopPropagation()
	
	const topDiv = document.createElement('div')
	topDiv.className = 'message-dialogue-top'
	
	if (type) {
		const iconDiv = document.createElement('div')
		iconDiv.className = 'icon ' + type + '-icon'
		topDiv.append(iconDiv)
	}
	
	const titleDiv = document.createElement('div')
	titleDiv.className = 'message-dialogue-title'
	titleDiv.innerText = title
	
	const closeDiv = document.createElement('div')
	closeDiv.type = 'button'
	closeDiv.className = 'message-dialogue-close close-button'
	closeDiv.onclick = (event) => blockerDiv.remove()
	closeDiv.innerText = 'X'
	
	const messageDiv = document.createElement('div')
	messageDiv.className = 'message-dialogue-message'
	
	const messageTextDiv = document.createElement('div')
	messageTextDiv.className = 'message-dialogue-message-text'
	messageTextDiv.innerText = message
	
	const bottomDiv = document.createElement('div')
	bottomDiv.className = 'message-dialogue-bottom'
	
	const okDiv = document.createElement('div')
	okDiv.type = 'button'
	okDiv.className = 'button3'
	okDiv.innerText = 'OK'
	okDiv.onclick = (event) => blockerDiv.remove()
	
	
	topDiv.append(titleDiv)
	topDiv.append(closeDiv)
	messageDiv.append(messageTextDiv)
	bottomDiv.append(okDiv)
	dialogueDiv.append(topDiv)
	dialogueDiv.append(messageDiv)
	dialogueDiv.append(bottomDiv)
	blockerDiv.append(dialogueDiv)
	overlayDiv.append(blockerDiv)
	
}