import React, {Component} from 'react';

import { Form, Row } from 'react-bootstrap';

export default class ExerciseText extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <p className="disableSelection" as={Row} style={{'marginBottom': '15px', textAlign: "justify"}}>{this.props.content.text}</p>
            );
        } else if (this.props.mode === "edit") {
            
            return (
                <Form.Control
                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)', textAlign: "justify"  }}
                    plaintext="true"
                    autoComplete="off"
                    as="textarea"
                    rows="10"
                    placeholder="Enter text"
                    name={this.props.content._id}
                    defaultValue={this.props.content.text}
                    onChange={this.props.onChange}
                />
            );
        }
    }

}