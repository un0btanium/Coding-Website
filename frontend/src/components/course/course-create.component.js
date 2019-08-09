import React, {Component} from 'react';
import Axios from 'axios';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default class CourseCreate extends Component {

    constructor(props) {
        super(props);

        this.onChangeCourseName = this.onChangeCourseName.bind(this);
        this.onChangeCourseImportString = this.onChangeCourseImportString.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: '',
            importString: ''
        }
    }

    render () {
        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                <h3>New Course</h3>
                
                <br />
                <br />

                <Form onSubmit={this.onSubmit}>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Name:</h5></Form.Label>
                        <Col sm={6}>
                            <Form.Control 
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                autoFocus
                                type="text"
                                className="form-control"
                                placeholder="Enter course name"
                                value={this.state.name}
                                onChange={this.onChangeCourseName}
                            />
                        </Col>
                    </Form.Group>
                    
                    <br/>
                    <br/>

                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Import:</h5></Form.Label>
                        <Col sm={6}>
                            <Form.Control 
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                type="text"
                                className="form-control"
                                placeholder="Or enter course json import string"
                                value={this.state.importString}
                                onChange={this.onChangeCourseImportString}
                            />
                        </Col>
                    </Form.Group>

                    <br/>
                    <br/>
                    
                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Create and Edit</Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }

    onChangeCourseName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeCourseImportString(e) {
        this.setState({
            importString: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.state.name === '' && this.state.importString === '') {
            return;
        }

        let name = this.state.name;
        let isVisibleToStudents = true;
        let exercises = [];
        if (this.state.importString !== '') {
            try {
                let json = JSON.parse(this.state.importString);

				name = json.name;
				isVisibleToStudents = json.isVisibleToStudents;
                exercises = json.exercises;
            } catch (e) {
                console.log(e);
                return;
            }
        }

        //console.log(`New Course created!`);
        //console.log(`Course Name: ${name}`);
        
        const newCourse = {
            name: name,
            isVisibleToStudents: isVisibleToStudents,
            exercises: exercises
        }
        
        //console.log(Axios.defaults.headers.common);
        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/course', newCourse)
            .then(res => {
                this.props.history.push('/course/' + res.data.id + '/exercises');
            });

        
    }

    
}