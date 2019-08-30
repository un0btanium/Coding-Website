# CodingBuddy - An e-learning coding website with statement highlighting on program runtime

This is a MERN stack website to help teach java programming by offering a custom in-code statement highlighter to help visualize the program's execution step-by-step. It allows for the creation of exercises by the maintainers which can then be solved by the students. Code is executed on the backend, eliminating the requirements for any additional software having to be installed on the students side. Nevertheless, optionally students can download the Electron App which allows them to run their programs locally to help reduce load on the backend server, however requires additional jdk installation and set JAVA_HOME and PATH=%JAVA_HOME%/bin variables.



## How to use

All projects require a installation of NodeJS.


### Backend

Install packages via:

```
npm install
```

Create a `.env` file with `JWT_KEY=` and a random combination of letters in the `backend` folder.

Run the backend server in development with

```
nodemon server
```

or in production with

```
npm start
```

The backend requires a MongoDB installation. Start the server as a service on Linux with

```
service mongod start
```

or on windows with


```
mongod
```

You also have to create a `\data\db` folder to save the database into.

And of course the backend also requires a java JDK installation. The `java` command has to be available on the console.



## Frontend

Install packages via 

```
npm install
```

Run the server with

```
npm start
```

Package the website for production (afterwards available in the `\build\` folder) with

```
npm run build
```

### Electron App

Install packages via 

```
npm install
```

```
npm start
```

Package the application for production (afterwards available in the `\out\` folder) with

```
npm run make
```

The Electron App does not wrap a website itself. It still loads the frontend webpage from the specified URL, however intercepts certain HTTP Requests to the backend which are responsible for executing code and writing to console. The Electron App currently does not have an auto-updater for the java executor jar responsible for the custom code execution highlighting.