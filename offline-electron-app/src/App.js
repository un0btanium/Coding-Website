import React, { Component } from 'react';
import { withRouter } from 'react-router'
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Link } from 'react-router-dom';

import logo from "./logo.svg";

import CourseList from "./components/course/course-list.component";
import CourseCreate from "./components/course/course-create.component";
import CourseImport from "./components/course/course-import.component";

import ExerciseList from "./components/exercise/exercise-list.component";
import ExerciseCreate from "./components/exercise/exercise-create.component";
import ExerciseView from "./components/exercise/exercise-view.component";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { setLetterHeight, setLetterWidth } from './services/FontDetector';

import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/bootstrap.min.css";
import "./theme/ProgressArrows.css";

import { Navbar, Nav, Container } from 'react-bootstrap';


const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, light

class App extends Component {


  constructor(props) {
    super(props);

    this.fontDetector = React.createRef();
  }

  componentDidMount() {
    const node = this.fontDetector.current;
    setLetterWidth(node.children[0].offsetWidth/100);
    setLetterHeight(node.children[0].offsetHeight);
  }

  requireAuth(allowedRoles, jsx, routeUnauthorized) {
      return jsx;
  }

  render() {
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
						<Nav.Link as={Link} variant="light" to="/course/import">Import course</Nav.Link>
						</Nav>

					</div>
				</Container>
			</Navbar>

			<ToastContainer />

			<Container>
				<Route exact path="/" component={CourseList} />

				<Route exact path="/courses" component={CourseList} />
				<Route exact path="/course/create" render={(props) => this.requireAuth(["admin", "maintainer"], <CourseCreate {...props}/>)} />
				<Route exact path="/course/import" render={(props) => this.requireAuth([], <CourseImport {...props}/>)} />

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