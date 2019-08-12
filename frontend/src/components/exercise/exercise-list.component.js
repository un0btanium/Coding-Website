import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';
import { toast } from 'react-toastify';

import { isAuthenticated } from "../../services/Authentication";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen, faTrashAlt, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons'

import ProgressArrows from './progress-arrows/progress-arrows.component'

export default class ExerciseList extends Component {
    
    constructor(props) {
		super(props);
		
        this.state = {
			course: {
				name: "Loading...",
				exercises: []
			},
			userExercisesData: {},
			
            showDeleteModalExercise: false,
			markedExercise: {},
			
            showDeleteModalCourse: false,
            markedCourse: {}
        };
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.props.match.params.courseID)
            .then(response => {
				this.setState({
					course: response.data.course,
					userExercisesData: response.data.userExercisesData
				});
			})
            .catch((error) => {
                console.error("Course not found!");
				this.props.history.push('/');
            });
    }

    render () {

        const Exercise = props => (
			<div
				className="disableSelection"
				onClick={() => this.solveExercise(props.exercise._id)}
				style={{
					order: props.index,
					flexGrow: 4,
					flexShrink: 2,
					justifyContent: "space-evenly",
					margin: "20px",
					padding: "30px",
					backgroundColor: "rgb(" + ((Math.random()*200)+55) +", " + ((Math.random()*200)+55) +", " + ((Math.random()*200)+55) +")",
					borderRadius: "25px",
					boxShadow: '2px 2px 5px #000000'
				}}
			>
				
				<div style={{ padding: "25px", backgroundColor: "rgba(0, 0, 0, 0.75)", borderRadius: "10px"}}>
					<div>
						<h2 style={{marginLeft: "20px"}}>
							{ isAuthenticated(["admin", "maintainer"]) && [
								<Button variant="danger" onClick={(e) => this.showDeleteModalExercise(e, props.exercise)} key="DeleteExerciseButton" style={{ marginLeft: "20px"}}><FontAwesomeIcon icon={faTrashAlt} /></Button>,
								<span key="span1"> </span>,
								<Button variant="primary" onClick={(e) => this.editExercise(e, props.exercise._id)} key="EditExerciseButton"><FontAwesomeIcon icon={faEdit} /></Button>,
								<span key="span2"> </span>,
								<Button variant="info" onClick={(e) => this.switchVisibilityExercise(e, props.exercise, props.index)} key="VisibilityExerciseButton"><FontAwesomeIcon icon={props.exercise.isVisibleToStudents ? faLockOpen : faLock} /></Button>
								]
							}
							<b style={{marginLeft: "20px"}}>{props.exercise.name} {!props.exercise.isVisibleToStudents ? <FontAwesomeIcon size="1x" style={{marginLeft: "20px"}} icon={faLock}/> : null }</b>
						</h2>
						<ProgressArrows
							arrows={props.exercise.subExercises}
							data={this.state.userExercisesData[props.exercise._id]}
						/>
					</div>
					
				</div>



            </div>
		);

		let exercisesEntries = null;
		if (this.state.course !== undefined) {
			exercisesEntries = this.state.course.exercises.map(function(currentExercise, i) {
				if (currentExercise.isVisibleToStudents || isAuthenticated(["admin", "maintainer"])) {
					return <Exercise exercise={currentExercise} key={i} index={i} />;
				} else {
					return null;
				}
			});
		}

        return (
            <div className="fadeIn" style={{marginTop: '50px'}}>
                
				<div style={{textAlign: "center"}}>
                	<h1>{this.state.course.name|| "Loading..."}</h1>
				</div>

				{isAuthenticated(["admin", "maintainer"]) &&
					[
					<Button variant="success" onClick={() => this.newExercise()} key="CreateExerciseButton"><FontAwesomeIcon icon={faPlus} /></Button>,
					<Button variant="info" onClick={() => this.switchVisibilityCourse()} key="VisibilityCourseButton"><FontAwesomeIcon icon={this.state.course.isVisibleToStudents ? faLockOpen : faLock} /></Button>,
					<Button variant="danger" onClick={() => this.showDeleteModalCourse(this.state.course)} key="DeleteCourseButton"><FontAwesomeIcon icon={faTrashAlt} /></Button>
				]
				}

				<div style={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", marginTop: "20px" }}>
					{exercisesEntries}
				</div>


                <Modal centered show={this.state.showDeleteModalExercise} onHide={() => this.closeDeleteModalExercise()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Exercise {this.state.markedExercise.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete the <b>Exercise</b>?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.closeDeleteModalExercise()}>
                        Cancel
                        </Button>
                        <Button variant="danger" onClick={() => this.deleteExercise(this.state.markedExercise._id)}>
                        Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
                <Modal centered show={this.state.showDeleteModalCourse} onHide={() => this.closeDeleteModalCourse()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Course {this.state.markedCourse.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete the <b>Course</b>?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.closeDeleteModalCourse()}>
                        Cancel
                        </Button>
                        <Button variant="danger" onClick={() => this.deleteCourse(this.state.markedCourse._id)}>
                        Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
	}
	


    showDeleteModalExercise(e, exercise) {
		e.stopPropagation();
        this.setState({
            markedExercise: exercise,
            showDeleteModalExercise: true
        });
    }

    closeDeleteModalExercise() {
        this.setState({
            showDeleteModalExercise: false,
            markedExercise: {}
        });
	}
	
	

    showDeleteModalCourse(course) {
        this.setState({
            showDeleteModalCourse: true,
            markedCourse: course
        });
    }

    closeDeleteModalCourse() {
        this.setState({
            showDeleteModalCourse: false,
            markedCourse: {}
        });
    }



	newExercise() {
		this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/create', {courseName: this.state.course.name})
	}

    editExercise(e, id) {
		e.stopPropagation();
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/edit');
    }

    solveExercise(id) {
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/solve');
    }

    deleteExercise(id) {
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
					
					toast(<div style={{textAlign: "center"}}>Deleted {this.state.course.exercises[index].name} exercise!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})

                    this.setState({
                        course: update(this.state.course, {
							exercises: {
								$splice: [[index, 1]]
							}
						}),
                        showDeleteModalExercise: false,
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
	
	
    deleteCourse(id) {
        Axios.delete(process.env.REACT_APP_BACKEND_SERVER + '/course/'+id)
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Deleted {this.state.course.name} course!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				this.props.history.push("/");
            })
            .catch(function (error) {
                console.log(error);
            });
	}
	


	switchVisibilityCourse(course) {
        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/visibility', { id: this.state.course._id, isVisibleToStudents: !this.state.course.isVisibleToStudents})
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Switched the visibility of the course '{this.state.course.name}' to '{response.data.isVisibleToStudents ? "visible" : "not visible"}'!</div>, {type: response.data.isVisibleToStudents ? toast.TYPE.SUCCESS : toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				this.setState({
					course: update(this.state.course, {
						isVisibleToStudents: {
							$set: response.data.isVisibleToStudents
						}
					})
				});
            })
            .catch(function (error) {
                console.log(error);
            });
	}

	switchVisibilityExercise(e, exercise, index) {
		e.stopPropagation();
        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/exercise/visibility', { courseID: this.state.course._id, exerciseID: exercise._id, isVisibleToStudents: !exercise.isVisibleToStudents})
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Switched the visibility of the exercise '{this.state.course.exercises[index].name}' to '{response.data.isVisibleToStudents ? "visible" : "not visible"}'!</div>, {type: response.data.isVisibleToStudents ? toast.TYPE.SUCCESS : toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				this.setState({
					course: update(this.state.course, {
						exercises: {
							[index]: {
								isVisibleToStudents: {
									$set: response.data.isVisibleToStudents
								}
							}
						}
					})
				});
            })
            .catch(function (error) {
                console.log(error);
            });
	}
}