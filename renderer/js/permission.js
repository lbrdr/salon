function checkPermission(request) {
	
	var permissionError
	
	if (request.status === 204) {
		if (
			request.statusText === 'User has insufficient permission.'
		) {
			tokenError = request.statusText + ' The action cannot be performed.'	
		}
	}
	
	if (permissionError) {
		createMessageDialogue('error', 'Permission Error', permissionError)
	}
	
	return permissionError
	
}