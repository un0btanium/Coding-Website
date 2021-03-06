import React, {Component} from 'react';


import { Form, Row, Col } from 'react-bootstrap';

import { log } from '../../../services/Logger';

const CACHE_STEPS = 100;
let consoleCache = {};

export default class ExerciseConsole extends Component {
    
    
    constructor(props) {
        super(props);

        this.onChangeConsoleInput = this.onChangeConsoleInput.bind(this);

        this.state = {
            consoleInputValue: ""
		}
		
		this.consoleTextAreaRef = React.createRef();
    }

	componentDidUpdate() {
		this.scrollToBottom();
	}

    render () {

        let consoleMessages = "";
        let inputField = null;
        if (this.props.result && this.props.step >= 0) {
			
			if (this.props.step === 0) {
				consoleCache = {};
				log("Resetting console cache");
			}

            let stepStart = 0;
            let lastCachePoint = this.props.step - (this.props.step % CACHE_STEPS);
            if (consoleCache[lastCachePoint] !== undefined) {
                consoleMessages = consoleCache[lastCachePoint];
                stepStart = lastCachePoint+1;
            }

            for (let i = stepStart; i <= this.props.step; i++) {
                if (this.props.result.steps[i].type === "console" || this.props.result.steps[i].type === "error") {
                    consoleMessages += this.props.result.steps[i].msg;
                }
                if (i % CACHE_STEPS === 0 && consoleCache[i] === undefined) {
                    consoleCache[i] = consoleMessages;
                    log("Saving console cache " + i);
                }
			}

            let type = this.props.result.steps[this.props.step].type;
            if (type && type === "htmlGui") {
                return null; // only print html gui, not console
            }
            
            if (this.props.result.isReadIn) {
                inputField =
                    <Form onSubmit={(e) => { this.props.onConsoleInput(e, this.state.consoleInputValue); this.setState({ consoleInputValue: '' }); }}>
                        <Form.Group as={Row} className="form-group">
                            <Form.Label column sm={3} style={{marginTop: '15px', textAlign: 'right'}}><h5>Console Input:</h5></Form.Label>
                            <Col sm={7}>
                                <Form.Control 
                                    autoFocus
                                    style={{marginTop: '15px', fontFamily: 'Consolas, "Courier New", Courier, monospace', color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                    plaintext="true"
                                    autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
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
                <div as={Row} style={{'width': '100%'}}>
					<Form.Control 
						ref={this.consoleTextAreaRef}
                        style={{minHeight: '75px', maxHeight: '700px', boxShadow: 'none', fontFamily: 'Consolas, "Courier New", Courier, monospace', color: '#FFFFFF', backgroundColor: '#000000'}}
                        autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false"
                        as="textarea"
                        rows="5"
                        name="console_output_textarea"
                        value={consoleMessages}
                        onChange={this.onChange}
                        readOnly={true}
                    />
                    {inputField}
                </div>
            );
        }

        return null;
    }

    onChangeConsoleInput(e) {
        this.setState({
            consoleInputValue: e.target.value
        });
    }

    onChange(e) {
        // placeholder to prevent warning by console textfield
    }

	scrollToBottom = () => {
		if (this.consoleTextAreaRef.current) {
			this.consoleTextAreaRef.current.scrollTop = this.consoleTextAreaRef.current.scrollHeight;
		}
	};

    // addConsoleCacheEntry(at, entry) {
    //     let tempCache = this.state.consoleCache;
    //     tempCache[at] = entry;
    //     this.setState({
    //         consoleCache: tempCache
    //     })
    // }

}