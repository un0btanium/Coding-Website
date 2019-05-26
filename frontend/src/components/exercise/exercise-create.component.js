import React, {Component} from 'react';
import Axios from 'axios';

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
            name: '',
            importString: ''
        }
    }

    render () {
        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                <h3>New Exercise</h3>
                
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
                                placeholder="Enter name"
                                value={this.state.name}
                                onChange={this.onChangeExerciseName}
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
                                placeholder="Or enter json import string"
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
        let content = null;
        let source_files = null;
        if (this.state.importString !== '') {
            try {
                let json = JSON.parse(this.state.importString);

                name = json.name;
                content = json.content;
                source_files = json.source_files;
            } catch (e) {
                console.log(e);
                return;
            } 
        }

        //console.log(`New exercise created!`);
        //console.log(`Exercise Name: ${name}`);
        
        const newExercise = {
            name: name,
            content: content,
            source_files: source_files
        }
        
        //console.log(Axios.defaults.headers.common);
        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise', newExercise)
            .then(res => {
                this.props.history.push('/exercise/edit/'+res.data.id);
            });

        
    }

    
}