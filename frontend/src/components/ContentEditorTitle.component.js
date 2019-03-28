import React, {Component} from 'react';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

export default class ContentEditorTitle extends Component {

    render () {
        return (
            <Form.Group as={Row} className="form-group">
                <Form.Label column sm><h5>Title:</h5></Form.Label>
                <Form.Control 
                    type="text"
                    className="form-control"
                    placeholder="Enter title"
                    name={this.props.content._id}
                    defaultValue={this.props.content.text}
                    onChange={this.props.onChange}
                />
            </Form.Group>
        );
    }
}