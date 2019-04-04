import React, {Component} from 'react';

import { registerUser } from "../../services/Authentication";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default class AuthenticationSignup extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            confirm_password: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    render () {

        return (
            <div style={{marginTop: '50px'}}>
                
                <h3>Signup</h3>
                <Form onSubmit={this.onSubmit} style={{marginTop: '50px'}}>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm><h5>eMail:</h5></Form.Label>
                        <Col sm={10}>
                            <Form.Control 
                                autoFocus
                                name="email"
                                type="email"
                                className="form-control"
                                placeholder="Enter eMail address"
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm><h5>Password:</h5></Form.Label>
                        <Col sm={10}>
                            <Form.Control 
                                autoFocus
                                name="password"
                                type="password"
                                className="form-control"
                                placeholder="Enter password"
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm><h5>Password:</h5></Form.Label>
                        <Col sm={10}>
                            <Form.Control 
                                autoFocus
                                name="confirm_password"
                                type="password"
                                className="form-control"
                                placeholder="Confirm password"
                                value={this.state.name}
                                onChange={this.handleChange}
                            />
                        </Col>
                    </Form.Group>
                        
                    <br/>
                    <br/>
                    
                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Signup</Button>
                    </Form.Group>
                </Form>

            </div>
        )
    }

    handleChange(e) {
        const target = e.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
    
        this.setState({
          [name]: value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.state.email === '' || this.state.password === '' || !(this.state.password === this.state.confirm_password)) {
            return;
        }
        
        const newUser = {
            email: this.state.email,
            password: this.state.password
        }

        registerUser(newUser, this.props.history, (err, res) => {});
    }

}