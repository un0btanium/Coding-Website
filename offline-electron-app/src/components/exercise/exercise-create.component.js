import React, {Component} from 'react';
import lzstring from 'lz-string';

import { createExercise } from '../../services/DataAPI';

import { toast } from 'react-toastify';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default class ExerciseCreate extends Component {

    constructor(props) {
        super(props);

        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseImportString = this.onChangeExerciseImportString.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
			courseID: this.props.match.params.courseID,
			courseName: this.props.location.state.courseName || "",
			name: '',
			isVisibleToStudents: true,
            importString: ''
        }
    }

    render () {
        return (
            <div className="fadeIn" style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
				<h2>Course {this.state.courseName}</h2>
                
				<br />

                <h4>New Exercise</h4>
                
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
                                placeholder="Enter exercise name"
                                value={this.state.name}
                                onChange={this.onChangeExerciseName}
                            />
                        </Col>
                    </Form.Group>

					<Form.Group as={Row} className="form-group">
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Visible:</h5></Form.Label>
                        <Col sm={6}>
							<Form.Check
								style={{marginTop: "10px"}} 
								id="toggleIsVisibleForStudents"
								draggable={false}
								type="checkbox"
								className="custom-switch"
								custom="true"
								label=""
								checked={this.state.isVisibleToStudents}
								onChange={(e) => {this.setState({ isVisibleToStudents: !this.state.isVisibleToStudents })}}
							/>
                        </Col>
                    </Form.Group>

					
                    
                    <br/>
                    <br/>

					<h4>Or Import:</h4>
					
                    <br/>

                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Import String:</h5></Form.Label>
                        <Col sm={6}>
                            <Form.Control 
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                type="text"
								as="textarea"
                                className="form-control"
                                placeholder="Or enter exercise import string"
                                value={this.state.importString}
                                onChange={this.onChangeExerciseImportString}
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

    onChangeExerciseName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeExerciseImportString(e) {
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
		let isVisibleToStudents = this.state.isVisibleToStudents;
		let subExercises = undefined;
		let highlightingDetailLevelIndex = 5;
		let iFrameUrl = "";
        if (this.state.importString !== '') {
            try {
                let json = JSON.parse(lzstring.decompressFromBase64(this.state.importString));
				
				name = json.name;
				isVisibleToStudents = json.isVisibleToStudents || true;
				highlightingDetailLevelIndex = json.highlightingDetailLevelIndex || 5;
				iFrameUrl = json.iFrameUrl || "";

				if (json.content !== undefined && json.source_files !== undefined) {
					subExercises = [{
						content: json.content,
						sourceFiles: json.source_files
					}];
				} else if (json.subExercises !== undefined) {
					subExercises = json.subExercises;
				} else {
					console.log("Faulty exercise import string!")
					toast(<div style={{textAlign: "center"}}>Faulty exercise import string!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
					return;
				}
            } catch (e) {
				console.log(e);
				toast(<div style={{textAlign: "center"}}>Faulty exercise import string!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				return;
            } 
        }

        //console.log(`New exercise created!`);
        //console.log(`Exercise Name: ${name}`);
        
        const data = {
			courseID: this.state.courseID,
			name: name,
			isVisibleToStudents: isVisibleToStudents,
			iFrameUrl: iFrameUrl,
			highlightingDetailLevelIndex: highlightingDetailLevelIndex,
			subExercises: subExercises
        }
        
        createExercise(data)
            .then(res => {
                this.props.history.push('/course/' + this.state.courseID + '/exercise/' + res.data.id + '/edit', { courseName: this.state.courseName});
			})
			.catch(err => {
				toast(<div style={{textAlign: "center"}}>Server Error! Unable to create exercise!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
			});

        
    }

    
}