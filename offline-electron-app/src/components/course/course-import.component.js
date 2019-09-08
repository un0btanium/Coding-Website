import React, {Component} from 'react';
import lzstring from 'lz-string';

import { importCourse } from '../../services/DataAPI';

import { toast } from 'react-toastify';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

export default class CourseImport extends Component {

    constructor(props) {
        super(props);

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            importString: ''
        }
    }

    render () {
        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                <h3>Import Course via Import String</h3>
                
                <br />
                <br />

                <Form onSubmit={this.onSubmit}>

                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Import String:</h5></Form.Label>
                        <Col sm={8}>
                            <Form.Control 
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                type="text"
								as="textarea"
								rows="3"
                                className="form-control"
                                placeholder="Enter the course import string"
                                value={this.state.importString}
                                onChange={(e) => this.setState({ importString: e.target.value })}
                            />
                        </Col>
                    </Form.Group>

                    <br/>
                    <br/>
                    
                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Import Course and User Code</Button>
                    </Form.Group>
                </Form>
            </div>
        )
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.state.importString === '') {
            return;
        }

		let json = undefined;
		try {
			json = JSON.parse(lzstring.decompressFromBase64(this.state.importString));

			if (!json || !json.course) {
				console.log("Faulty course import string!")
				toast(<div style={{textAlign: "center"}}>Faulty course import string!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
				return;
			}

		} catch (e) {
			console.log(e);
			toast(<div style={{textAlign: "center"}}>Faulty course import string!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
			return;
		}

		if (!json) {
			return;
		}
        
        importCourse(json)
            .then(res => {
                this.props.history.push('/course/' + res.data.id + '/exercises');
            })
			.catch(err => {
				toast(<div style={{textAlign: "center"}}>Unable to create course!</div>, {type: toast.TYPE.ERROR, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})
			});
        
    }

    
}