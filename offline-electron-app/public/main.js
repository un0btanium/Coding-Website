const path = require('path');
const url = require('url');
const { app, BrowserWindow, ipcMain } = require('electron');
const lzstring = require('lz-string');
const { spawn } = require('child_process');

const isDev = require('electron-is-dev');

if (require('electron-squirrel-startup')) {
	p.quit();
}


let javaProcess = undefined;

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

	mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html#/courses')}`);


	mainWindow.maximize();

	if (isDev) {
		mainWindow.webContents.openDevTools();
	}
		

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



/* Code Execution */

ipcMain.on('write-to-process', (event, arg) => {
	let input = arg.input;

	if (input !== undefined && javaProcess !== undefined && javaProcess.process != undefined) {
		console.log("Writing input '" + input + "' to java process!");
		
		javaProcess.res = event;

		try {
			javaProcess.process.stdin.write(input + '\n');
		} catch (e) {
			console.log(e);
			event.reply('process-response', { successful: false, errMsg: "Unable to write to program!" });
		}
	} else {
		console.warn("No java process available anymore to write to!");
		event.reply('process-response', { successful: false, errMsg: "Java program was already termined!" });
		javaProcess = undefined;
	}
});

ipcMain.on('start-process', (event, arg) => {

	if (javaProcess !== undefined) {
		console.log("Killing java process!");
		javaProcess.process.kill('SIGINT');
		console.log(javaProcess.process.killed ? "Killed java process!" : "Didnt kill java process!");
		javaProcess = undefined;
	}
	
	let javaExe = "java";
	// let javaExe = "C:" + path.sep + "Program Files" + path.sep + "Java" + path.sep + "jdk-11" + path.sep + "bin" + path.sep + "java.exe";
	
	let filePath;
	if (isDev) {
		filePath =  __dirname + path.sep + "java" + path.sep + "executer.jar";
	} else {
		filePath =  process.resourcesPath + path.sep + "java" + path.sep + "executer.jar";
	}
	
	console.log(filePath);
	let javaChild = undefined;
	
	try {
		javaChild = spawn(javaExe, ["-jar", "-Dfile.encoding=UTF-8", filePath, JSON.stringify(arg)], {});
	} catch (e) {
		event.reply('process-response', { successful: false, errMsg: "No java installed or missing JAVA_HOME and/or PATH entry!" });
		console.log(e);
		return;
	}
	
	javaProcess = {
		res: event,
		dataArray: [],
		process: javaChild
	};
	
	javaChild.stdin.setDefaultEncoding("UTF-8");
	
	javaChild.stdout.on('data', function (data) {
		console.log("out")
	
		if (!javaProcess) {
			console.log("process closed");
			return;
		}
		
		if (data && javaProcess.res) {
			javaProcess.dataArray.push(data);
			
			try {
				let buffers = [];
				for (let buffer of javaProcess.dataArray) {
					buffers.push(Buffer.from(buffer, "utf-8"));
				}
	
				let finalBuffer = Buffer.concat(buffers);
				
				try {
					let jsonString = finalBuffer.toString("utf-8")
					if (jsonString.includes("}",jsonString.length-4)) {
						let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it
	
						if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
							let compressedJson = lzstring.compressToBase64(jsonString);
							
							javaProcess.dataArray = [];
							javaProcess.res.reply('process-response', { successful: true, res: { data: { compressedJson: compressedJson } } });
							javaProcess.res = undefined;
						}
					}
				} catch (e) {
					console.error("Not the end of json string!");
				}
			} catch (e) {
				console.error(e);
			}
		}
	});
	javaChild.stderr.on('data', function (err) {
		console.log("error")
	
		if (!javaProcess) {
			console.log("process closed");
			return;
		}
	
		if (err && javaProcess.res) {
			javaProcess.res.reply('process-response', { successful: false, errMsg: err.toString() }); // TODO send to client and print on screen (warp in json error step)
			javaProcess.res = undefined;
		}
	});
	javaChild.on('close', function (exitCode) {
		console.log("close")
	
		if (!javaProcess) {
			console.log("process closed");
			return;
		}
	
		if (!javaProcess.res) {
			console.log("canceled response (data was already send)");
			return;
		}
	
		if (exitCode === null) {
			return;
		}
	
		let buffers = [];
		for (let buffer of javaProcess.dataArray) {
			buffers.push(Buffer.from(buffer, "utf-8"));
		}
	
		let finalBuffer = Buffer.concat(buffers);
		
		try {
			let jsonString = finalBuffer.toString("utf-8");
			if (jsonString.includes("}",jsonString.length-4)) {
				JSON.parse(jsonString); // checks if this is valid json
	
				let compressedJson = lzstring.compressToBase64(jsonString);
				
				javaProcess.res.reply('process-response', { successful: true, res: { data: { compressedJson: compressedJson } } });
				javaProcess = undefined;
			} else {
				console.error("Not a valid json string on program close!");
				javaProcess.res.reply('process-response', { successful: false, errMsg: "Server error on code execution (no json)" });
				javaProcess = undefined;
			}
		} catch (e) {
			console.error(e);
			javaProcess.res.reply('process-response', { successful: false, errMsg: "" });
			javaProcess = undefined;
		}
	
	});
});

