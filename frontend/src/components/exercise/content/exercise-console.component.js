import React, {Component} from 'react';

import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';

export default class ExerciseConsole extends Component {
    
    render () {
        // TODO create own console text area with tooltip hover which hightlights the System.out.println method
        // TODO edit view
        return (
            <div as={Row} style={{'marginBottom': '30px', 'marginTop': '30px', 'borderColor': '#666666', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                <Form.Control 
                    as="textarea"
                    rows="10"
                    name="console_output_textarea"
                    //value={this.props.console_output}
                    value={this.listConsole()}
                    onChange={this.onChange}
                    readOnly={false}
                />
            </div>
        );
    }

    listConsole() {
        let output = "";
        this.props.console_output.forEach(element => {
            output += element.message;
        });
        return output;
    }

    onChange(e) {
        // placeholder to prevent warning
    }
}