import React, {Component} from 'react';

import { Form, Row, Col, ButtonGroup, DropdownButton, Dropdown, Button, ProgressBar } from 'react-bootstrap';

const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, light

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
        // TODO put whole execution lopic in here! (keeps exercise view cleaner and less binding)
        

        let onConsoleInput = this.props.onConsoleInput;
        let consoleMessages = "";
        let guiElements = null;
        if (this.props.result && this.props.step >= 0) {
            for (let i = 0; i <= this.props.step; i++) {
                if (this.props.result.steps[i].type === "console") {
                    consoleMessages += this.props.result.steps[i].msg;
                }
            }
            if (this.props.result.steps[this.props.step].type === "htmlGui") {
                console.log(this.props.result.steps[this.props.step].guiElements);
                guiElements = this.props.result.steps[this.props.step].guiElements.map(function(guiRow, i) {
                    let guiRowElements = guiRow.map(function(guiElement, i) {
                        let element = null;
                        switch(guiElement.type) {
                            case "square":
                                let rgbSquare = 'rgb(' + guiElement.color.red + ', ' + guiElement.color.green + ', ' + guiElement.color.blue + ')';
                                element = <Col style={{ width: '50px', height: '50px', margin: '2px', backgroundColor: rgbSquare }} >{guiElement.labelText}</Col>;
                                break;
                            case "button":
                                let rgbButton = 'rgb(' + guiElement.color.red + ', ' + guiElement.color.green + ', ' + guiElement.color.blue + ')';
                                element = <Button style={{ width: '50px', height: '50px', margin: '2px', backgroundColor: rgbButton }} onClick={(e) => { onConsoleInput(e, guiElement.id) }}>{guiElement.labelText}</Button>;
                                break;
                            default:
                                element = null;
                                break;
                        }
                        return element;
                    })
                    return <Row>{guiRowElements}</Row>;
                });
            }
        }

        let consoleField = null;
        let htmlGui = null;
        let inputField = null;
        let progressBar = null;
        if (this.props.result && this.props.result.steps) {
            consoleField = 
                <Form.Control 
                    style={{'fontFamily': 'Consolas,monaco,monospace'}}
                    as="textarea"
                    rows="10"
                    name="console_output_textarea"
                    //value={this.props.console_output}
                    value={consoleMessages}
                    onChange={this.onChange}
                    readOnly={false}
                />;
            progressBar = <ProgressBar style={{height: '15px', marginLeft: '1px', marginRight: '1px'}} min={0} max={this.props.result.steps.length} now={this.props.step+1} label={(this.props.step+1) + "/" + this.props.result.steps.length}></ProgressBar>;
            if (this.props.result.isReadIn) {
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
            htmlGui =
                <div>
                    {guiElements}
                </div>;
        }
        
        
        return (
            <div  as={Row} style={{'marginBottom': '500px', 'marginTop': '30px', 'borderColor': '#666666', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                {consoleField}
                {htmlGui}
                <div>
                    {progressBar}
                    {inputField}
                    <div style={{margin: '10px'}}>
                        <ButtonGroup style={{float: 'left'}}>
                            <DropdownButton onChange={this.props.onSimulationSpeedChange} id="dropdown-basic-button" title={("Speed (" + this.props.delay + "ms)")}>
                                <Dropdown.Item onSelect={this.props.onSimulationSpeedChange} active={this.props.delay === 32 ? true : false} eventKey="32" >32ms</Dropdown.Item>
                                <Dropdown.Item onSelect={this.props.onSimulationSpeedChange} active={this.props.delay === 64 ? true : false} eventKey="64">64ms</Dropdown.Item>
                                <Dropdown.Item onSelect={this.props.onSimulationSpeedChange} active={this.props.delay === 128 ? true : false} eventKey="128">128ms</Dropdown.Item>
                                <Dropdown.Item onSelect={this.props.onSimulationSpeedChange} active={this.props.delay === 256 ? true : false} eventKey="256">256ms</Dropdown.Item>
                                <Dropdown.Item onSelect={this.props.onSimulationSpeedChange} active={this.props.delay === 512 ? true : false} eventKey="512">512ms</Dropdown.Item>
                            </DropdownButton>
                        </ButtonGroup>
                        <ButtonGroup style={{marginLeft: '22%'}}>
                            <Button style={{width: '100px'}} bg={BG} variant={VARIANT} onClick={this.props.onPreviousStepClick}>Previous</Button>
                            <Button style={{width: '100px'}} bg={BG} variant={VARIANT} onClick={this.props.onNextStepClick}>Next</Button>
                        </ButtonGroup>
                        <ButtonGroup style={{float: 'right'}}>
                            <Button style={{width: '150px'}} variant="success" onClick={this.props.runCode} >Run Code</Button>
                        </ButtonGroup>
                    </div>
                </div>
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