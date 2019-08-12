import React, {Component} from 'react';
import Axios from 'axios';

import { isAuthenticated } from "../../services/Authentication";

import { Button } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLock, faPlus } from '@fortawesome/free-solid-svg-icons'

export default class CourseList extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            courses: [],
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

		const Course = props => (
			<div
				className="disableSelection"
				onClick={() => this.enterCourse(props.course._id)}
				style={{
					order: props.index,
					flexGrow: 4,
					flexShrink: 2,
					justifyContent: "space-evenly",
					margin: "20px",
					padding: "30px",
					backgroundColor: "rgb(" + ((Math.random()*200)+55) +", " + ((Math.random()*200)+55) +", " + ((Math.random()*200)+55) +")",
					boxShadow: '2px 2px 5px #000000'
				}}
			>
				<div style={{ padding: "50px", backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
					<h3><b>{props.course.name}</b></h3>
					<span style={{marginRight:"25px"}}><b><span style={{fontSize: "30px", marginRight:"5px"}}>{props.course.exercisesAmount}</span> Aufgabenblätter</b></span>
					<span style={{}}><b><span style={{fontSize: "30px", marginRight:"5px"}}>{props.course.subExercisesAmount}</span> Aufgaben</b>  {!props.course.isVisibleToStudents ? <FontAwesomeIcon size="2x" style={{marginLeft: "20px"}} icon={faLock}/> : null }</span>
				</div>
			</div>
        );

        return (
            <div style={{marginTop: '50px'}}>
                
				<div style={{textAlign: "center"}}>
                	<h1>Courses</h1>
				</div>
				
				{isAuthenticated(["admin", "maintainer"]) && <Button variant="success" onClick={() => this.newCourse()}><FontAwesomeIcon icon={faPlus} /></Button>}
                    
				<div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", marginTop: "20px" }}>
					{ 
						this.state.courses.map(function(currentCourse, i) {
							if (currentCourse.isVisibleToStudents || isAuthenticated(["admin", "maintainer"])) {
								return <Course course={currentCourse} index={i} key={"Course" + i} />;
							} else {
								return null;
							}
						})
					}
				</div>
            </div>
        )
    }

	newCourse() {
		this.props.history.push('/course/create')
	}

    enterCourse(id) {
        this.props.history.push('/course/' + id + '/exercises');
    }

}