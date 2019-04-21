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
        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            name: ''
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

    onSubmit(e) {
        e.preventDefault();

        if (this.state.name === '') {
            return;
        }

        console.log(`New exercise created!`);
        console.log(`Exercise Name: ${this.state.name}`);
        
        const newExercise = {
            name: this.state.name
        }
        
        console.log(Axios.defaults.headers.common);
        Axios.post('http://localhost:4000/exercise', newExercise)
            .then(res => {
                this.props.history.push('/exercise/edit/'+res.data.id);
            });
    }

    
}