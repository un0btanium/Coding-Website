import React, {Component} from 'react';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default class ExerciseText extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <p as={Row} style={{'marginBottom': '15px'}}>{this.props.content.text}</p>
            );
        } else if (this.props.mode === "edit") {
            return (
                <Form.Group as={Row} className="form-group">
                    <Form.Label column sm><h5>Text:</h5></Form.Label>
                    <Form.Control 
                        as="textarea"
                        rows="10"
                        placeholder="Enter text"
                        name={this.props.content._id}
                        defaultValue={this.props.content.text}
                        onChange={this.props.onChange}
                    />
                </Form.Group>
            );
        }
    }

}