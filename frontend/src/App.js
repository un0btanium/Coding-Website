import React, { Component } from 'react';
import { BrowserRouter as Router, Route} from "react-router-dom";


import logo from "./logo.svg";

import ExerciseList from "./components/exercise-list.component";
import ExerciseCreate from "./components/exercise-create.component";
import ExerciseEdit from "./components/exercise-edit.component";
import ExerciseSolve from "./components/exercise-solve.component";


import "bootstrap/dist/css/bootstrap.min.css";
import "./theme/bootstrap.min.css";

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Container from 'react-bootstrap/Container';


const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, light

class App extends Component {
  render() {
    return (
      <Router>
        <div>
          <Navbar bg={BG} variant={VARIANT}>
            <Container>
              <Navbar.Toggle aria-controls="responsive-navbar-nav" />
              <Navbar.Brand href="/exercises">
                <img src={logo} width="30" height="30" alt="Coding Buddy Logo" />
                {' Coding Buddy'}
              </Navbar.Brand>
              
              <div className="collapse navbar-collapse">
                <Nav className="mr-auto">
                  <Nav.Link variant="light" href="/exercises">Exercises</Nav.Link>
                  <Nav.Link href="/exercise/create">New</Nav.Link>
                </Nav>
              </div>
            </Container>
          </Navbar>
          <br />

        <Container>
          <Route path="/" exact component={ExerciseList} />
          <Route path="/exercises" component={ExerciseList} />
          <Route path="/exercise/create" component={ExerciseCreate} />
          <Route path="/exercise/edit/:id" component={ExerciseEdit} />
          <Route path="/exercise/solve/:id" component={ExerciseSolve} />
        </Container>
        </div>
      </Router>
    );
  }
}

export default App;
