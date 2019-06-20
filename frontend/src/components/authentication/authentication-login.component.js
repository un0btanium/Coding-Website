import React, {Component} from 'react';

import { loginUser } from "../../services/Authentication";

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default class AuthenticationLogin extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    render () {

        return (
            <div style={{marginTop: '50px'}}>
                
                <h3>Login</h3>
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
                    
                    <br/>
                    <br/>
                    
                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Login</Button>
                    </Form.Group>
                </Form>

            </div>
        )
    }

    handleChange(e) {
        this.setState({
          [e.target.name]: e.target.value
        });
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.state.email === '' || this.state.password === '') {
            return;
        }
        
        const userCredentials = {
            email: this.state.email,
            password: this.state.password
        }

        loginUser(userCredentials, this.props.history, (err, res) => {
            if (res) {
                this.props.updateUserData(res.data);
            }
        }, "/exercises");
    }

}