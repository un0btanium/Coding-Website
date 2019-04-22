import React, {Component} from 'react';

import { Form, Row, Col } from 'react-bootstrap';

export default class ExerciseConsole extends Component {
    
    
    constructor(props) {
        super(props);

        this.onChangeConsoleInput = this.onChangeConsoleInput.bind(this);

        this.state = {
            consoleInputValue: ""
        }
    }

    render () {
        // TODO create own console text area with tooltip hover which hightlights the System.out.println method
        // TODO edit view
        
        let consoleMessages = "";
        if (this.props.result && this.props.step >= 0) {
            for (let i = 0; i <= this.props.step; i++) {
                if (this.props.result.steps[i].type === "console") {
                    consoleMessages += this.props.result.steps[i].msg;
                }
            }
        }

        let inputField = null;
        if (this.props.result && this.props.result.isReadIn) {
            inputField =
                <Form onSubmit={(e) => { this.props.onConsoleInput(e, this.state.consoleInputValue) }}>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={3} style={{marginTop: '15px', textAlign: 'right'}}><h5>Console Input:</h5></Form.Label>
                        <Col sm={7}>
                            <Form.Control 
                                autoFocus
                                style={{marginTop: '15px', color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                type="text"
                                className="form-control"
                                placeholder="Enter input"
                                value={this.state.consoleInputValue}
                                onChange={this.onChangeConsoleInput}
                            />
                        </Col>
                    </Form.Group>
                </Form>;
        }
        
        
        return (
            <div  as={Row} style={{'marginBottom': '30px', 'marginTop': '30px', 'borderColor': '#666666', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                <Form.Control 
                    style={{'fontFamily': 'Consolas,monaco,monospace'}}
                    as="textarea"
                    rows="10"
                    name="console_output_textarea"
                    //value={this.props.console_output}
                    value={consoleMessages}
                    onChange={this.onChange}
                    readOnly={false}
                />
                {inputField}
            </div>
        );
    }

    onChangeConsoleInput(e) {
        this.setState({
            consoleInputValue: e.target.value
        });
    }

    onChange(e) {
        // placeholder to prevent warning
    }
}