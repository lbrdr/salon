const readline = require('readline')
const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = false
const isMac = process.platform === 'darwin'

const database = require('./database.js')

const clientOnly = false

// Preprocess html files
require('./html-preprocess.js')

// Preprocess user manual data
require('./user-manual-preprocess.js')

if (!clientOnly) {
	// Start server
	require('./server.js')
}



function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: 'Hairliners Salon',
		width: isDev ? 1500: 1000,
		height: isDev ? 750: 539,
		webPreferences: {
			backgroundThrottling: false,
		},
	})
	
	mainWindow.setResizable(isDev);
	
	// Open devtools if in dev env
	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}



// App is ready
app.whenReady().then(async () => {
	createMainWindow()
	
	// Remove Menu
	Menu.setApplicationMenu(null)
})