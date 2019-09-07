const { app, BrowserWindow } = require('electron');
const os = require('os');
const path = require('path');



if (require('electron-squirrel-startup')) {
	p.quit();
}

let mainWindow;

const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 1280,
		minHeight: 720,
		fullscreenable: false,
		center: true,
		// frame: false,
		title: 'Coding Buddy',
		webPreferences: {
			nodeIntegration: true,
			devTools: true
		}
	});

	mainWindow.setMenu(null);

	const startUrl = process.env.ELECTRON_START_URL || url.format({
		pathname: path.join(__dirname, '/../build/index.html'),
		protocol: 'file:',
		slashes: true
	});
	mainWindow.loadURL(startUrl);


	mainWindow.maximize();

	mainWindow.webContents.openDevTools(); // DEBUGGING

	mainWindow.on('closed', () => {
		mainWindow = null;
	});
};



app.on('ready', createWindow);

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if (mainWindow === null) {
		createWindow();
	}
});