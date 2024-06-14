const readline = require('readline')
const path = require('path')
const { app, BrowserWindow, Menu } = require('electron')

const isDev = process.env.NODE_ENV !== 'production'
const isMac = process.platform === 'darwin'

const database = require('./database.js')


// Preprocess html
require('./html-preprocess.js')

// Start server
require('./server.js')



function createMainWindow() {
	const mainWindow = new BrowserWindow({
		title: 'Hairliners Salon',
		width: isDev ? 1500: 1000,
		height: 600
	})
	
	// Open devtools if in dev env
	if (isDev) {
		mainWindow.webContents.openDevTools()
	}

	mainWindow.loadFile(path.join(__dirname, './renderer/index.html'))
}



// App is ready
app.whenReady().then(async () => {
	createMainWindow()
	
	// Implement Menu
	const mainMenu = Menu.buildFromTemplate(menu)
	Menu.setApplicationMenu(mainMenu)
})



// Menu Template
const menu = [
	{
		label: 'File',
		submenu: [
			{
				label: 'Quit',
				click: () => app.quit(),
				accelerator: 'CmdOrCtrl+W'
			}
		]
	}
];