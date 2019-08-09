import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

import { isAuthenticated } from "../../services/Authentication";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert'

export default class ExerciseList extends Component {
    
    constructor(props) {
		super(props);
        this.state = {
			course: {
				name: "Loading...",
				exercises: []
			},
            alerts: [],
            showDeleteModal: false,
            markedExercise: {}
        };
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.props.match.params.courseID)
            .then(response => {
				this.setState({
					course: response.data.course
				});
			})
            .catch((error) => {
                console.error("Course not found!");
				this.props.history.push('/');
            });
    }

    render () {

        return (
            <div style={{marginTop: '50px'}}>
                
                <h3>{this.state.course.name || "Loading..."}</h3>
				
				{isAuthenticated(["admin", "maintainer"]) && <Button variant="success" onClick={() => this.newExercise()}>Create New Exercise</Button>}
                    

                <table className="table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th style={{'width':'250px'}}>Actions</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.exerciseList() }
                    </tbody>
                </table>
                <Modal centered show={this.state.showDeleteModal} onHide={() => this.closeDeleteModal()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Exercise {this.state.markedExercise.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete the exercise?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.closeDeleteModal()}>
                        Cancel
                        </Button>
                        <Button variant="danger" onClick={() => this.delete(this.state.markedExercise._id)}>
                        Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }



    alertList() {
        const TimedDeleteAlert = props => (
            <Alert centered show={this.state.showDeleteAlert} variant="success" style={{height: '50px', textAlign: 'center'}}>
                <p>currentAlert</p>
            </Alert>
        );
        return this.state.alerts.map(function(currentAlert, i) {
            return <TimedDeleteAlert alert={currentAlert} key={i} />;
        });
    }

    exerciseList() {
        // TODO Excerise not as table but list with custom areas
        const Exercise = props => (
            <tr>
                <td>
                    { isAuthenticated(["admin", "maintainer"]) && [
                        <Button variant="danger" onClick={() => this.showDeleteModal(props.exercise)} key="DeleteExerciseButton">Delete</Button>,
                        <span key="span1"> </span>,
                        <Button variant="primary" onClick={() => this.editExercise(props.exercise._id)} key="EditExerciseButton">Edit</Button>,
                        <span key="span2"> </span>
                        ]
                    }
                    <Button variant="info" onClick={() => this.solveExercise(props.exercise._id)}>Solve</Button>
                </td>
                <td>
                    <h5 style={{'height': '20px', 'lineHeight': '37px'}}>{props.exercise.name}</h5>
                    <div className="progress-arrows-wrap">
                        {
							props.exercise.subExercises !== undefined &&
								props.exercise.subExercises.map(function(value, i) {
									const arrowWidth = Math.min(((((1/props.exercise.subExercises.length)*100))-(0.5)), 6)+"%";
									let style = { width:arrowWidth, marginLeft:"5px", };
									return <div style={style} className="progress-arrow" key={i}></div>
								})
                        }
                    </div>
                </td>
                
            </tr>
		);
		if (this.state.course !== undefined) {
			return this.state.course.exercises.map(function(currentExercise, i) {
				if (currentExercise.isVisibleToStudents || isAuthenticated(["admin", "maintainer"])) {
					return <Exercise exercise={currentExercise} key={i} />;
				} else {
					return null;
				}
			});
		} else {
			return null;
		}
    }



    showDeleteModal(exercise) {
        this.setState({
            markedExercise: exercise,
            showDeleteModal: true
        });
    }

    closeDeleteModal() {
        this.setState({
            showDeleteModal: false,
            markedExercise: {}
        });
    }



	newExercise() {
		this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/create', {courseName: this.state.course.name})
	}

    editExercise(id) {
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/edit');
    }

    solveExercise(id) {
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/solve');
    }

    delete(id) {
        Axios.delete(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.props.match.params.courseID + '/exercise/' + id)
            .then(response => {

                let index = -1
                // let name = "";

                let counter = 0;
                for (let exercise of this.state.course.exercises) {
                    if (exercise._id === id) {
                        index = counter;
                        // name = exercise.name;
                        break
                    }
                    counter++;
				} 

                if (index !== -1) {
                    this.setState({
                        course: update(this.state.course, {
							exercises: {
								$splice: [[index, 1]]
							}
						}),
                        showDeleteModal: false,
                        markedExercise: {}
                        // , alerts: this.state.alerts.push("Exercise '" + name + "'deleted!")
                    });
                }
            })
            .catch(function (error) {
				// TODO show error message to user
                console.log(error);
            });
    }
}