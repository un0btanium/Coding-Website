const { app, session, BrowserWindow, BrowserView } = require('electron');
const lzstring = require('lz-string');
const Axios = require ('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const express = require('express');
const expressApp = express();
expressApp.use(cors());
expressApp.use(bodyParser.json());

const URLS = {
	"development": {
		frontend: 'http://localhost:3000/',
		backend: 'http://localhost:4000/api'
	},
	"production": {
		frontend: 'http://coding-buddy.mni.thm.de/',
		backend: 'http://coding-buddy.mni.thm.de:80/api'
	}
}

// const CODING_BUDDY_URLS = URLS["development"];
const CODING_BUDDY_URLS = URLS["production"];

console.log(CODING_BUDDY_URLS)

const URL_FILTER = {
	urls: [
		CODING_BUDDY_URLS.backend + '/exercise/run',
		CODING_BUDDY_URLS.backend + '/exercise/input'
	]
}

let javaProcess = undefined;

expressApp.route("/api/exercise/input")
	.post(function (req, res) {

        let input = req.body.input;

        if (input !== null && javaProcess !== undefined && !javaProcess.killed) {
            console.log("Writing input '" + input + "' to java process!");
            let javaChild = javaProcess;

            res.dataArray = [];

            javaChild.stdout.on('data', function (data) {
                console.log("stdout input");
                if (data && !res.isDataSend) {
					res.dataArray.push(data);
					
                    try {
                        let buffers = [];
                        for (let buffer of res.dataArray) {
                            buffers.push(Buffer.from(buffer));
                        }

                        let finalBuffer = Buffer.concat(buffers);

                        try {
                            let jsonString = finalBuffer.toString()
                            if (jsonString.includes("}",jsonString.length-4)) {
                                let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it isnt
                                
                                if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
                                    let compressedJson = lzstring.compressToBase64(jsonString);
                                    let jsonMessage = {
                                        compressedJson: compressedJson
                                    };
                                    
									res.dataArray = [];
                                    res.isDataSend = true;
                                    res.status(200).json(jsonMessage);
                                }
                            }
                        } catch (e) {
                            console.error("Not the end of json string!");
                        }
                    } catch (e) {
                        console.error(e);
						res.status(400).json({});
                    }
                }
            });
            javaChild.stderr.on('data', function (err) {
                console.log("stderr input");
                if (err && !res.isDataSend) {
					res.isDataSend = true;
					res.status(400).json({});
                    console.log(err.toString()); // TODO send to client and print on screen (warp in json error step)
                }
            });
            javaChild.on('close', function (exitCode) {
                console.log("close input");
                console.log(exitCode);
                
                if (res.isDataSend) {
                    console.log("canceled response (data was already send)");
                    return;
                }

                javaProcess = undefined;

                if (exitCode === null) {
                    console.log("canceled response (exitCode ist null)");
					res.isDataSend = true;
					res.status(400).json({});
                    return;
                }

                
                let buffers = [];
                for (let buffer of res.dataArray) {
                    buffers.push(Buffer.from(buffer));
                }

                let finalBuffer = Buffer.concat(buffers);

                // console.log(finalBuffer.toString());
                try {
                    let jsonString = finalBuffer.toString()
                    if (jsonString.includes("}",jsonString.length-4)) {
                        JSON.parse(jsonString); // checks if this is valid json

                        let compressedJson = lzstring.compressToBase64(jsonString);
                        let jsonMessage = {
                            compressedJson: compressedJson
                        };
                        
						res.dataArray = [];
                        res.isDataSend = true;
                        res.status(200).json(jsonMessage);
                    }
                } catch (e) {
                    console.error(e);
					res.dataArray = [];
                    res.isDataSend = true;
                    res.status(400).json({});
                }

            });
            try {
                javaChild.stdin.write(input + '\n');
            } catch (e) {
                console.log(e);
				res.status(400).json({});
            }
        } else {
			console.warn("No java process available anymore to write to!");
			res.status(400).json({});
			// TODO send response to cancel code execution clientside
        }
	});

expressApp.route("/api/exercise/run")
    .post(function (req, res) {


		let data = {...req.body};
		data.isElectronApp = true;
		
        let options = {
            timeout: 180*1000,
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
		};
		
		setAuthToken(req.headers.authorization);
        Axios.post(CODING_BUDDY_URLS.backend + '/exercise/run', data, options)
            .then(response => {
                if (response.status === 200) {
					
					let code_snippets = req.body.code_snippets;
					let sourceFiles = req.body.sourceFiles || response.data.sourceFiles;
					let highlightingDetailLevelIndex = req.body.highlightingDetailLevelIndex;
					
					let arg = {
						highlightingDetailLevelIndex: highlightingDetailLevelIndex || 0,
						code_snippets: code_snippets,
						source_files: sourceFiles
					}
	

					if (javaProcess !== undefined) {
						console.log("Killing java process!");
						javaProcess.kill('SIGINT');
						console.log(javaProcess.killed ? "Killed java process!" : "Didnt kill java process!");
						javaProcess = undefined;
					}

					res.dataArray = [];
					let javaExe = "java";
					if (os.platform() === 'win32') {
						// javaExe = "C:" + path.sep + "Program Files" + path.sep + "Java" + path.sep + "jdk-11" + path.sep + "bin" + path.sep + "java.exe";
						javaExe = "java";
					}
					let processOptions = { maxBuffer: 1024*1024*1024 ,timeout: 30*1000, /* windowsHide: false */ };
					let filePath = __dirname + path.sep + "java" + path.sep + "executer.jar";

					let javaChild;

					try {
						javaChild = spawn(javaExe, ["-jar", filePath, JSON.stringify(arg)], processOptions);
					} catch (e) {
						console.log("No java installed or missing JAVA_HOME and/or PATH entry")
						res.isDataSend = true;
						res.status(400).json({ errMsg: "No java installed or missing JAVA_HOME and/or PATH entry"});
						return;
					}
	
					javaProcess = javaChild;

					javaChild.stdout.on('data', function (data) {
						console.log("stdout run");
						if (data && !res.isDataSend) {
							res.dataArray.push(data);
							
							try {
								let buffers = [];
								for (let buffer of res.dataArray) {
									buffers.push(Buffer.from(buffer));
								}
		
								let finalBuffer = Buffer.concat(buffers);
								
								try {
									let jsonString = finalBuffer.toString()
									if (jsonString.includes("}",jsonString.length-4)) {
										let json = JSON.parse(jsonString); // checks if it is the end of the json string, throws error if it
		
										if (json !== null && (json.isReadIn || json.isGuiReadIn)) {
											let compressedJson = lzstring.compressToBase64(jsonString);
											let jsonMessage = {
												compressedJson: compressedJson
											};
											
											res.dataArray = [];
											res.isDataSend = true;
											res.status(200).json(jsonMessage);
										}
									}
								} catch (e) {
									console.error("Not the end of json string!");
								}
							} catch (e) {
								res.status(400).json({});
								console.error(e);
							}
						}
					});
					javaChild.stderr.on('data', function (err) {
						console.log("stderr run");
						if (err && !res.isDataSend) {
							res.isDataSend = true;
							res.status(400).json({});
							console.log(err.toString()); // TODO send to client and print on screen (warp in json error step)
						}
					});
					javaChild.on('close', function (exitCode) {
						console.log("close run");
						
						if (res.isDataSend) {
							console.log("canceled response (data was already send)");
							return;
						}
						
						javaProcess = undefined;

						if (exitCode === null) {
							console.log("canceled response (exitCode ist null)");
							res.status(400).json({});
							return;
						}
	
						let buffers = [];
						for (let buffer of res.dataArray) {
							buffers.push(Buffer.from(buffer));
						}
		
						let finalBuffer = Buffer.concat(buffers);
		
						// console.log(finalBuffer.toString());
						try {
							let jsonString = finalBuffer.toString();
							if (jsonString.includes("}",jsonString.length-4)) {
								JSON.parse(jsonString); // checks if this is valid json
	
								let compressedJson = lzstring.compressToBase64(jsonString);
								let jsonMessage = {
									compressedJson: compressedJson
								};
	
								res.dataArray = [];
								res.isDataSend = true;
								res.status(200).json(jsonMessage);
							}
						} catch (e) {
							console.error(e);
							res.dataArray = [];
							res.isDataSend = true;
							res.status(400).json({});
						}
		
					});
                }
            })
            .catch(function (error) {
				if (error.response) {
					res.res = error.response;
					res.status(error.response.status).json({...error.response.data || {}});
				} else {
					console.error(error);
					res.status(400).send({});
				}
            })
	});



const PORT = 8080;
expressApp.listen(PORT, function () {
	console.log("Server running on Port: " + PORT);
});



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

	mainWindow.loadURL(CODING_BUDDY_URLS.frontend);
	// let view = new BrowserView();
	// mainWindow.setBrowserView(view);
	// view.setBounds({
	// 	x: 0,
	// 	y: 0,
	// 	width: 1280,
	// 	height: 720
	// });
	// view.setAutoResize({
	// 	width: true,
	// 	height: true,
	// 	horizontal: true,
	// 	vertical: true
	// });
	// view.webContents.loadURL(CODING_BUDDY_URL.frontend);


	mainWindow.maximize();

	// view.webContents.openDevTools(); // DEBUGGING

	mainWindow.on('closed', () => {
		mainWindow = null;
	});


	session.defaultSession.webRequest.onBeforeRequest(URL_FILTER, (details, callback) => {
		if (details.method === 'POST') {
			const { url } = details;
			callback({ cancel: false, redirectURL: encodeURI(url.replace(CODING_BUDDY_URLS.backend, 'http://localhost:8080/api').replace(CODING_BUDDY_URLS.frontend, 'http://localhost:8080/')) })
		} else {
			callback({ cancel: false });
		}
	})
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

const setAuthToken = token => {
    if (token) {
        Axios.defaults.headers.common['Authorization'] = token;
    } else {
        delete Axios.defaults.headers.common['Authorization'];
    }
}