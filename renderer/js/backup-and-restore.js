async function barBackupData() {

	const backupRequest = await queryRequest(
		'POST',
		{
			action: 'backup-and-restore-backup-data',
			token
		},
		undefined,
		{
			responseType: 'arraybuffer'
		}
	);
	
	{
		const tokenError = await checkToken(backupRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(backupRequest)
		if (permissionError) { return permissionError; }
	}
	
	const data = backupRequest.response
	
	const output = document.getElementById("output")
	const view = new DataView(data);
	const blob = new Blob([view], { type: 'application/x-sqlite3' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url
	a.download =
		'salon management backup_' +
		(new Date())
			.toJSON()
			.replace(/\//g, '-')
			.replace(/:/g, ';') +
		'.db'
	a.style.display = undefined
	document.body.appendChild(a)
	a.click()
	a.remove()
	
}

function barRestoreData() {
			
	const fileInput = document.getElementById("backup-and-restore-file")
	const file = fileInput.files[0]
	if (!file) { return; }
	
	const okButton = document.createElement('input')
	okButton.value = 'OK'
	okButton.type = 'button'
	okButton.className = 'button3'
	
	const cancelButton = document.createElement('input')
	cancelButton.value = 'Cancel'
	cancelButton.type = 'button'
	cancelButton.className = 'button4'
	
	const dialogue = createMessageDialogue(
		'warning',
		'Data Restoration Warning',
		'Restoring from backup data will erase all the current system data. ' +
		'Press OK to continue.',
		[
			okButton,
			cancelButton
		]
	)
	
	okButton.onclick = () => {
		dialogue.remove()
		barSubmitRestore(file)
	}
	
	cancelButton.onclick = () => {dialogue.remove()}
	
}

async function barSubmitRestore(data) {
	
	const restoreRequest = await queryRequest(
		'POST',
		{
			action: 'backup-and-restore-restore-data',
			token
		},
		data
	);
	
	{
		const tokenError = await checkToken(restoreRequest)
		if (tokenError) { return tokenError; }
		const permissionError = checkPermission(restoreRequest)
		if (permissionError) { return permissionError; }
	}
	
	if (restoreRequest.status === 200) {
		token = undefined
		currentUser = undefined
		setPage('login')
		createMessageDialogue('success', 'Data Restoration Successful', restoreRequest.statusText)
		return
	}
	
	createMessageDialogue('error', 'Data Restoration Failed', restoreRequest.statusText)
	
}

function barCancelRestore() {
}