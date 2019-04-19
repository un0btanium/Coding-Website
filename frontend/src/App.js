import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { BrowserRouter as Router, Route, Redirect} from "react-router-dom";
import { Link } from 'react-router-dom';

import { isAuthenticated, getUserData, logoutUser, loginUser } from "./services/Authentication";

import logo from "./logo.svg";

import AuthenticationSignup from "./components/authentication/authentication-signup.component";
import AuthenticationLogin from "./components/authentication/authentication-login.component";

import ExerciseList from "./components/exercise/exercise-list.component";
import ExerciseCreate from "./components/exercise/exercise-create.component";
import ExerciseView from "./components/exercise/exercise-view.component";


import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/bootstrap.min.css";
import "./theme/ProgressArrows.css";

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';


const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, light

class App extends Component {


  constructor(props) {
    super(props);
    this.state = {
      user: null
    };
    this.updateUserData = this.updateUserData.bind(this);
    this.logOutUser = this.logOutUser.bind(this);
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
      // DEBUG AUTO LOGIN
      const userCredentials = {
        email: "admin@gmail.com",
        password: "admin"
      };
      loginUser(userCredentials, this.props.history, (err, res) => {
          if (res) {
              this.props.updateUserData(res.data);
          }
      }, "/exercise/solve/5c93c7290f2dd828a4a56b31");

      // return <Redirect to="/login" />;
    }
    // not authorized
    const role = getUserData().role;
    if(!role || (allowedRoles && allowedRoles.length > 0 && allowedRoles.indexOf(role) === -1)) {
      return <Redirect to={routeUnauthorized} />;
    }

    return jsx;
  }

  render() {

    let rightNavbar;
    if (isAuthenticated()) {
      rightNavbar = <Nav>
          <Navbar.Text style={{ marginTop:'2px'}}>Signed in as: {this.state.user ? this.state.user.email : "unknown"}</Navbar.Text>
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
          <Navbar bg={BG} variant={VARIANT}>
            <Container>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Brand as={Link} to="/">
                <img src={logo} width="30" height="30" alt="Logo" />
                {' Coding Buddy'}
              </Navbar.Brand>
              
              <div className="collapse navbar-collapse">

                <Nav className="mr-auto">
                  <Nav.Link as={Link} variant="light" to="/exercises">Exercises</Nav.Link>
                  <Nav.Link as={Link} to="/exercise/create">New</Nav.Link>
                </Nav>

                {rightNavbar}

              </div>
            </Container>
          </Navbar>
          <br />

        <Container>
          <Route exact path="/" component={ExerciseList} />
          <Route exact path="/signup" component={AuthenticationSignup} />
          <Route exact path="/login" render={(props) => <AuthenticationLogin {...props} updateUserData={this.updateUserData} />} />
          <Route exact path="/exercises" component={ExerciseList} />
          <Route exact path="/exercise/create" render={(props) => this.requireAuth(["admin", "maintainer"], <ExerciseCreate {...props}/>)} />
          <Route path="/exercise/edit/:id" render={(props) => this.requireAuth(["admin", "maintainer"], <ExerciseView {...props} mode={"edit"} />)} />
          <Route path="/exercise/solve/:id" render={(props) => this.requireAuth([], <ExerciseView {...props} mode={"solve"} />)} />
        </Container>
        </div>
      </Router>
    );
  }
}

export default withRouter(App);