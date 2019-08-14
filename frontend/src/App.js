import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { BrowserRouter as Router, Route, Redirect} from "react-router-dom";
import { Link } from 'react-router-dom';

import { isAuthenticated, getUserData, logoutUser, loginUser } from "./services/Authentication";

import logo from "./logo.svg";

import AuthenticationSignup from "./components/authentication/authentication-signup.component";
import AuthenticationLogin from "./components/authentication/authentication-login.component";

import UserOverview from "./components/admin/user-overview.component";
import ProcessOverview from "./components/admin/process-overview.component";

import CourseList from "./components/course/course-list.component";
import CourseCreate from "./components/course/course-create.component";

import ExerciseList from "./components/exercise/exercise-list.component";
import ExerciseCreate from "./components/exercise/exercise-create.component";
import ExerciseView from "./components/exercise/exercise-view.component";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setLetterHeight, setLetterWidth } from './services/FontDetector';

import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/bootstrap.min.css";
import "./theme/ProgressArrows.css";

import { Navbar, Nav, Container, Button } from 'react-bootstrap';


const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, light

class App extends Component {


  constructor(props) {
    super(props);

    this.fontDetector = React.createRef();

    this.state = {
      user: null
    };
    this.updateUserData = this.updateUserData.bind(this);
    this.logOutUser = this.logOutUser.bind(this);
  }

  componentDidMount() {
    if (process.env.NODE_ENV === "development") {
      const userCredentials = {
        email: "admin@gmail.com",
        password: "admin"
      };
      loginUser(userCredentials, this.props.history, (err, res) => {
          if (res) {
              this.updateUserData(res.data);
          }
      }, null);
    }

    
    const node = this.fontDetector.current;
    setLetterWidth(node.children[0].offsetWidth/100);
    setLetterHeight(node.children[0].offsetHeight);
  }

  updateUserData(userData) {
    this.setState({
      user: userData
    });
  }

  logOutUser(e) {
    logoutUser(this.props.history, (err, res) => {
      if (res) {
        this.updateUserData(null);
      }
    });
  }

  requireAuth(allowedRoles, jsx, routeUnauthorized) {
    routeUnauthorized = routeUnauthorized || "/";
    
    // not authenticated
    if(!isAuthenticated()) {
      // TODO
      // DEBUG AUTO LOGIN
      if (process.env.NODE_ENV === "production") {
        return <Redirect to="/login" />;
      } else {
        const userCredentials = {
          email: "admin@gmail.com",
          password: "admin"
        };
        loginUser(userCredentials, this.props.history, (err, res) => {
            if (res) {
                this.updateUserData(res.data);
    
                // not authorized
                const role = getUserData().role;
                if(!role || (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(role) === -1)) {
                  return <Redirect to={routeUnauthorized} />;
                }
    
                return jsx;
            }
            // TODO err messages
        }, null);
        return jsx;
      }
    } else {
  
      // not authorized
      const role = getUserData().role;
      if(!role || (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(role) === -1)) {
        return <Redirect to={routeUnauthorized} />;
      }
  
      return jsx;
    }
  }

  render() {

    let rightNavbar;
    if (isAuthenticated()) {
      rightNavbar = <Nav>
			{isAuthenticated(["admin"]) && 
				<>
					<Nav.Link as={Link} to="/users">Users</Nav.Link>
					<Nav.Link as={Link} style={{ marginRight: '25px'}} to="/processes">Processes</Nav.Link>
				</>
			}
          <Navbar.Text style={{ marginTop:'2px'}}>Signed in as: {this.state.user ? (this.state.user.name || this.state.user.email) : "unknown"}</Navbar.Text>
          <Nav.Link as={Button} style={{ marginLeft: '5px', width: '80px'}} onClick={this.logOutUser}>Logout</Nav.Link>
        </Nav>;
    } else {
      rightNavbar = <Nav>
          <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
          <Nav.Link as={Link} to="/login">Login</Nav.Link>
        </Nav>;
    }

    return (
    <Router>
        <div>
          <span ref={this.fontDetector} style={{ fontFamily: 'Consolas, "Courier New", Courier, monospace', position: 'absolute', width: 'auto', height: 'auto', margin: '0px', padding: '0px', fontSize: '18px', left: '-9999px' }}><span>WIwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwiwi</span></span>

          <Navbar bg={BG} variant={VARIANT} style={{ boxShadow: '0px 2px 5px #000000'}}>
				<Container className="disableSelection">
					<Navbar.Toggle aria-controls="responsive-navbar-nav" />
					<Navbar.Brand as={Link} to="/">
						<img src={logo} width="30" height="30" alt="Logo" />
						{' Coding Buddy'}
					</Navbar.Brand>
					
					<div className="collapse navbar-collapse">

						<Nav className="mr-auto">
						<Nav.Link as={Link} variant="light" to="/courses">Courses</Nav.Link>
						</Nav>

						{rightNavbar}

					</div>
				</Container>
			</Navbar>

			<ToastContainer />

			<Container>
				<Route exact path="/" component={CourseList} />
				<Route exact path="/signup" component={AuthenticationSignup} />
				<Route exact path="/login" render={(props) => <AuthenticationLogin {...props} updateUserData={this.updateUserData} />} />

				<Route exact path="/users" render={(props) => this.requireAuth(["admin"], <UserOverview {...props}/>)} />
				<Route exact path="/processes" render={(props) => this.requireAuth(["admin"], <ProcessOverview {...props}/>)} />

				<Route exact path="/courses" component={CourseList} />
				<Route exact path="/course/create" render={(props) => this.requireAuth(["admin", "maintainer"], <CourseCreate {...props}/>)} />

				<Route exact path="/course/:courseID/exercises" render={(props) => this.requireAuth([], <ExerciseList {...props}/>)} />
				<Route exact path="/course/:courseID/exercise/create" render={(props) => this.requireAuth(["admin", "maintainer"], <ExerciseCreate {...props}/>)} />
				<Route exact path="/course/:courseID/exercise/:exerciseID/edit" render={(props) => this.requireAuth(["admin", "maintainer"], <ExerciseView {...props} mode={"edit"} />)} />
				<Route exact path="/course/:courseID/exercise/:exerciseID/solve" render={(props) => this.requireAuth([], <ExerciseView {...props} mode={"solve"} />)} />
			</Container>
        </div>
    </Router>
    );
  }
}

export default withRouter(App);