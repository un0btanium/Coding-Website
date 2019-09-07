import React, {Component} from 'react';
import lzstring from 'lz-string';
import update from 'immutability-helper';
import { toast } from 'react-toastify';

import { getCourse, getCourseFull, moveExercise, deleteExercise, deleteCourse, switchCourseVisibility, switchExerciseVisibility } from '../../services/DataAPI';

import { isAuthenticated } from "../../services/Authentication";

import { Button, Modal, ButtonGroup, Form } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faLockOpen, faTrashAlt, faEdit, faPlus, faCaretUp, faCaretDown, faDownload } from '@fortawesome/free-solid-svg-icons'

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
			markedCourse: {},
			
			courseExportJSONString: ""
        };
    }

    componentDidMount() {
        getCourse(this.props.match.params.courseID)
            .then(response => {
				this.setState({
					course: response.data.course,
					userExercisesData: response.data.userExercisesData
				});
			})
            .catch((error) => {
				console.log(error)
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
								<ButtonGroup key="ButtonGroupMoveExercise" vertical="true" style={{ marginLeft: "20px"}}>
									<Button variant="secondary" size="sm" onClick={(e) => this.moveExercise(e, props.exercise._id, true)} key="MoveExerciseUpButton"><FontAwesomeIcon icon={faCaretUp} /></Button>
									<Button variant="secondary" size="sm" onClick={(e) => this.moveExercise(e, props.exercise._id, false)} key="MoveExerciseDownButton"><FontAwesomeIcon icon={faCaretDown} /></Button>
								</ButtonGroup>,
								<span key="span3"> </span>,
								<Button variant="primary" onClick={(e) => this.editExercise(e, props.exercise._id)} key="EditExerciseButton"><FontAwesomeIcon icon={faEdit} /></Button>,
								<span key="span4"> </span>,
								<Button variant="info" onClick={(e) => this.switchVisibilityExercise(e, props.exercise, props.index)} key="VisibilityExerciseButton"><FontAwesomeIcon icon={props.exercise.isVisibleToStudents ? faLockOpen : faLock} /></Button>
								]
							}
							{ isAuthenticated(["admin"]) && [
								<span key="span5"> </span>,
								<Button variant="danger" onClick={(e) => this.showDeleteModalExercise(e, props.exercise)} key="DeleteExerciseButton"><FontAwesomeIcon icon={faTrashAlt} /></Button>
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
					<Button variant="warning" onClick={() => this.exportCourseAsJSON()} key="ExportCourseButton"><FontAwesomeIcon icon={faDownload} /></Button>
					]
				}
				{isAuthenticated(["admin"]) &&
					<Button variant="danger" onClick={() => this.showDeleteModalCourse(this.state.course)} key="DeleteCourseButton"><FontAwesomeIcon icon={faTrashAlt} /></Button>
				}
				

				{
					this.state.courseExportJSONString &&
					<Form.Control
						style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
						plaintext="true"
						autoComplete="off"
						as="textarea"
						rows="3"
						name="CourseExportJSONStringTextArea"
						defaultValue={this.state.courseExportJSONString}
					/>
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



	moveExercise(e, id, moveUp) {
		e.stopPropagation();
		
		let data = {
			id: this.state.course._id,
			exerciseID: id,
			moveUp: moveUp
		}

        moveExercise(data)
            .then(response => {
				this.setState({
					course: update(this.state.course, {
						exercises: {
							$set: response.data.exercises || []
						}
					})
				});
            })
            .catch(function (error) {
                toast(<div style={{textAlign: "center"}}>Failed to move exercise!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });
	}

	newExercise() {
		this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/create', {courseName: this.state.course.name})
	}

    editExercise(e, id) {
		e.stopPropagation();
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/edit', {courseName: this.state.course.name});
    }

    solveExercise(id) {
        this.props.history.push('/course/' + this.props.match.params.courseID + '/exercise/' + id + '/solve', {courseName: this.state.course.name});
    }

    deleteExercise(id) {
        deleteExercise(this.props.match.params.courseID, id)
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
                toast(<div style={{textAlign: "center"}}>Unable to delete exercise!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });
	}
	
	
    deleteCourse(id) {
        deleteCourse(id)
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Deleted {this.state.course.name} course!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				this.props.history.push("/");
            })
            .catch(function (error) {
                toast(<div style={{textAlign: "center"}}>Unable to delete course '{this.state.course.name}'!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });
	}
	


	switchVisibilityCourse(course) {
        switchCourseVisibility(this.state.course._id, this.state.course.isVisibleToStudents)
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Switched the visibility of the course '{this.state.course.name}' to '{response.data.isVisibleToStudents ? "visible" : "not visible"}'!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				this.setState({
					course: update(this.state.course, {
						isVisibleToStudents: {
							$set: response.data.isVisibleToStudents
						}
					})
				});
            })
            .catch(function (error) {
				toast(<div style={{textAlign: "center"}}>Unable to switch visibility of course '{this.state.course.name}'!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });
	}

	switchVisibilityExercise(e, exercise, index) {
		e.stopPropagation();
        switchExerciseVisibility(this.state.course._id, exercise._id, exercise.isVisibleToStudents)
            .then(response => {
				toast(<div style={{textAlign: "center"}}>Switched the visibility of the exercise '{this.state.course.exercises[index].name}' to '{response.data.isVisibleToStudents ? "visible" : "not visible"}'!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
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
				toast(<div style={{textAlign: "center"}}>Unable to switch visibility of exercise '{this.state.course.exercises[index].name}'!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });
	}

	
    exportCourseAsJSON() {

        getCourseFull(this.state.course._id)
            .then(response => {
				let courseCopy = {...response.data.course};
				delete courseCopy._id;
				
				courseCopy.exercises = [];
				for (let originalExercise of response.data.course.exercises) {
					let exercise = {...originalExercise};
					delete exercise._id;
		
					let newSubExercises = [];
					for (let originalSubExercise of exercise.subExercises) {
						let subExercise = {...originalSubExercise};
						delete subExercise._id;
		
						let newContent = [];
						for (let c of subExercise.content) {
							let contentCopy = {...c};
							delete contentCopy._id;
							newContent.push(contentCopy);
						}
		
						let newSourceFiles = [];
						for (let sourceFile of subExercise.sourceFiles) {
							let sourceFileCopy = {...sourceFile};
							delete sourceFileCopy._id;
							newSourceFiles.push(sourceFileCopy);
						}
		
						subExercise.content = newContent;
						subExercise.sourceFiles = newSourceFiles;
		
						newSubExercises.push(subExercise);
					}
		
					courseCopy.exercises.push(exercise);
				}
				
				let course = JSON.stringify(courseCopy);
				
				this.setState({
					courseExportJSONString: lzstring.compressToBase64(course)
				});
            })
            .catch(function (error) {
				toast(<div style={{textAlign: "center"}}>Unable to create course export string!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
                console.log(error);
            });

    }
}