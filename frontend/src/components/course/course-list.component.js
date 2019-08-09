import React, {Component} from 'react';
import Axios from 'axios';

import { isAuthenticated } from "../../services/Authentication";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert'

export default class CourseList extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            courses: [],
            alerts: [],
            showDeleteModal: false,
            markedCourse: {},
            page: 0
        };
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/courses/' + this.state.page)
            .then(response => {
                this.setState({
                    courses: response.data.courses,
                    page: response.data.page
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render () {

        return (
            <div style={{marginTop: '50px'}}>
                
                <h3>Courses</h3>
				
				{isAuthenticated(["admin", "maintainer"]) && <Button variant="success" onClick={() => this.newCourse()}>Create New Course</Button>}
                    

                <table className="table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th style={{'width':'250px'}}>Actions</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.courseList() }
                    </tbody>
                </table>
                <Modal centered show={this.state.showDeleteModal} onHide={() => this.closeDeleteModal()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Course {this.state.markedCourse.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete the course?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.closeDeleteModal()}>
                        Cancel
                        </Button>
                        <Button variant="danger" onClick={() => this.delete(this.state.markedCourse._id)}>
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

    courseList() {
        // TODO Excerise not as table but list with custom areas
        const Course = props => (
            <tr>
                <td>
                    { isAuthenticated(["admin"]) && [
                        <Button variant="danger" onClick={() => this.showDeleteModal(props.course)} key="DeleteCourseButton">Delete</Button>,
                        <span key="span1"> </span>
                        ]
                    }
                    <Button variant="info" onClick={() => this.enterCourse(props.course._id)}>Enter</Button>
                </td>
                <td>
                    <h5 style={{'height': '20px', 'lineHeight': '37px'}}>{props.course.name}</h5>
                </td>
                
            </tr>
        );
        return this.state.courses.map(function(currentCourse, i) {
			if (currentCourse.isVisibleToStudents || isAuthenticated(["admin", "maintainer"])) {
				return <Course course={currentCourse} key={"Course" + i} />;
			} else {
				return null;
			}
        });
    }



    showDeleteModal(course) {
        this.setState({
            markedCourse: course,
            showDeleteModal: true
        });
    }

    closeDeleteModal() {
        this.setState({
            showDeleteModal: false,
            markedCourse: {}
        });
    }



	newCourse() {
		this.props.history.push('/course/create')
	}

    enterCourse(id) {
        this.props.history.push('/course/' + id + '/exercises');
    }

    delete(id) {
        Axios.delete(process.env.REACT_APP_BACKEND_SERVER + '/course/'+id)
            .then(response => {

                let index = -1
                // let name = "";

                let counter = 0;
                for (let course of this.state.courses) {
                    if (course._id === id) {
                        index = counter;
                        break
                    }
                    counter++;
                } 

                if (index !== -1) {
					let courses = [...this.state.courses];
					courses.splice(index, 1);
                    this.setState({
                        courses: courses,
                        showDeleteModal: false,
                        markedCourse: {}
                        // , alerts: this.state.alerts.push("Course '" + name + "'deleted!")
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}