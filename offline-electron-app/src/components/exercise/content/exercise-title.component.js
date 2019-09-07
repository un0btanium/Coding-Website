import React, {Component} from 'react';

import { Form, Row } from 'react-bootstrap';

export default class ExerciseTitle extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <h4 className="disableSelection" as={Row} style={{'marginBottom': '20px'}}>{this.props.content.text}</h4>
            );
        } else if (this.props.mode === "edit") {
            
            return (
                <Form.Control 
                    style={{color: 'white', fontSize: "20px", border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    placeholder="Enter title"
                    name={this.props.content._id}
                    defaultValue={this.props.content.text}
                    onChange={this.props.onChange}
                />
            );
        }
    }

}