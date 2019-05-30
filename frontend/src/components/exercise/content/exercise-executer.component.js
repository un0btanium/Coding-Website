import React, {Component} from 'react';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'

import Axios from 'axios';

import { Row,  ButtonGroup, DropdownButton, Dropdown, Button, ProgressBar } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFastBackward, faStepBackward, faPlay, faPause, faStepForward, faFastForward, faSpinner } from '@fortawesome/free-solid-svg-icons';

import ExerciseConsole from './exercise-console.component';
import ExerciseHTMLGUI from './exercise-htmlgui.component';

import { log, logError } from '../../../services/Logger';

const BG = "primary"; // primary, dark, light
const VARIANT = "dark"; // dark, ligh

let timeout = null;


export default class ExerciseExecuter extends Component {
    
    
    constructor(props) {
        super(props);

        this.runCode = this.runCode.bind(this);
        this.onSimulationSpeedChange = this.onSimulationSpeedChange.bind(this);
        this.simulateNextStep = this.simulateNextStep.bind(this);
        this.onFirstStepClick = this.onFirstStepClick.bind(this);
        this.onNextStepClick = this.onNextStepClick.bind(this);
        this.onPauseUnpauseClick = this.onPauseUnpauseClick.bind(this);
        this.onPreviousStepClick = this.onPreviousStepClick.bind(this);
        this.onLastStepClick = this.onLastStepClick.bind(this);
        this.onConsoleInput  = this.onConsoleInput.bind(this);
        

        this.state = {
            isExecutingOnServer: false,
            result: null,
            step: 0,
            delay: 128,
            isRunning: false,

            resetConsoleCache: false
        }
    }

    componentWillUnmount() {
        clearTimeout(timeout);
    }

    render () {

        let progressBar = null;
        if (this.state.result && this.state.result.steps) {
            progressBar = <ProgressBar style={{height: '15px', marginLeft: '1px', marginRight: '1px'}} min={0} max={this.state.result.steps.length} now={this.state.step+1} label={(this.state.step+1) + "/" + this.state.result.steps.length}></ProgressBar>;
        }
        
        
        return (
            <div style={{'marginBottom': '500px'}}>
                <div  as={Row} style={{ 'marginTop': '30px', 'borderColor': '#666666', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                    <div>
                        <div style={{margin: '10px'}}>
                            <ButtonGroup style={{float: 'left'}}>
                                <Slider
                                    mode={1}
                                    step={1}
                                    domain={[0, 5]}
                                    rootStyle={{position: 'relative', width: '200px', height: '40px', touchAction: 'none'}}
                                    // onChange={this.onChangeSlider}
                                    values={[1]}
                                >
                                    <Rail>
                                    {({ getRailProps }) => (  // adding the rail props sets up events on the rail
                                        <div style={{position: 'absolute', width: '100%', height: '10px', marginTop: '15px', borderRadius: '5px', backgroundColor: '#4e5d6c'}} {...getRailProps()} /> 
                                    )}
                                    </Rail>
                                    <Handles>
                                        {({ handles, getHandleProps }) => (
                                            <div className="slider-handles">
                                                {handles.map(handle => (
                                                    <Handle
                                                    key={handle.id}
                                                    handle={handle}
                                                    getHandleProps={getHandleProps}
                                                />
                                                ))}
                                            </div>
                                        )}
                                    </Handles>
                                    <Tracks right={false}>
                                        {({ tracks, getTrackProps }) => (
                                            <div className="slider-tracks">
                                            {tracks.map(({ id, source, target }) => (
                                                <Track
                                                key={id}
                                                source={source}
                                                target={target}
                                                getTrackProps={getTrackProps}
                                                />
                                            ))}
                                            </div>
                                        )}
                                    </Tracks>
                                </Slider>
                            </ButtonGroup>
                            <ButtonGroup style={{marginLeft: '12%'}}>
                                <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onFirstStepClick}><FontAwesomeIcon icon={faFastBackward} /></Button>
                                <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onPreviousStepClick}><FontAwesomeIcon icon={faStepBackward} /></Button>
                                <ButtonGroup>
                                    <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onPauseUnpauseClick}>{this.state.isRunning ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}</Button>
                                    <DropdownButton bg={BG} variant={VARIANT} onChange={this.onSimulationSpeedChange} id="dropdown-speed-button">
                                        <Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 32 ? true : false} eventKey="32">32ms</Dropdown.Item>
                                        <Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 64 ? true : false} eventKey="64">64ms</Dropdown.Item>
                                        <Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 128 ? true : false} eventKey="128">128ms</Dropdown.Item>
                                        <Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 256 ? true : false} eventKey="256">256ms</Dropdown.Item>
                                        <Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 512 ? true : false} eventKey="512">512ms</Dropdown.Item>
                                    </DropdownButton>
                                </ButtonGroup>
                                <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onNextStepClick}><FontAwesomeIcon icon={faStepForward} /></Button>
                                <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onLastStepClick}><FontAwesomeIcon icon={faFastForward} /></Button>
                            </ButtonGroup>
                            <ButtonGroup style={{float: 'right'}}>
                                <Button style={{width: '150px'}} variant="success" onClick={this.runCode} >{this.state.isExecutingOnServer ? <span><FontAwesomeIcon icon={faSpinner} pulse={true} size="lg" /> Running...</span> : "Run Code"}</Button>
                            </ButtonGroup>
                        </div>
                        {progressBar}
                    </div>
                </div>
                <ExerciseConsole
                    result={this.state.result}
                    step={this.state.step}
                    onConsoleInput={this.onConsoleInput}
                    resetConsoleCache={this.state.resetConsoleCache}
                />
                <ExerciseHTMLGUI
                    result={this.state.result}
                    step={this.state.step}
                    onConsoleInput={this.onConsoleInput}
                />
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




    onConsoleInput(e, value) {
        e.preventDefault()

        let data = {
            input: ''+value
        }

        let options = {
            timeout: 60*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };
        
        this.setState({
            isExecutingOnServer: true
        });

        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/input', data, options)
            .then(response => {
                if (response.status === 200) {
                    log(response);
                    this.saveCodeResponse(response.data, this.state.result.steps.length-1);
                } else {
                    log(response);
                    // TODO stop code execution because something went wrong
                }
            })
            .catch(function (error) {
                logError(error);
            })
            .finally(() => {
                this.setState({
                    isExecutingOnServer: false
                });
            });
    }



    runCode(e) {

        // TODO add delay of 5 seconds before making another request as well as a spinning button
        // TODO only rerun code result if code does not contain user inputs (OR: SPLIT RERUN AND RUN (when input))

        if (this.state.isExecutingOnServer) {
            return;
        }

        if (!this.props.didChangeCode) {
            this.setState({
                step: 0
            });
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
            log("Rerun code!");
            return;
        }

        let code_snippets = {};
        for (let currentContent of this.props.content) {
            if (currentContent.type === "editor") {
                code_snippets[currentContent.identifier] = {
                    code: currentContent.code
                }
            }
        }

        let data = {
            id: this.props.exerciseID,
            code_snippets: code_snippets
        }

        log(data);
        
        let options = {
            timeout: 30*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };
        
        this.setState({
            isExecutingOnServer: true
        });

        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/run', data, options)
            .then(response => {
                if (response.status === 200) {
                    log(response);
                    this.saveCodeResponse(response.data, 0);
                }
            })
            .catch(function (error) {
                logError(error);
            })
            .finally(() => {
                this.setState({
                    isExecutingOnServer: false
                });
            });
    }

    saveCodeResponse(json, startAtStep) {

        log(json);

        if (json && json.steps && json.steps.length > 0) {
            if (startAtStep === 0) {
                this.setState({
                    resetConsoleCache: true,
                    step: 0,
                    isExecutingOnServer: false
                });
            }
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            this.setState({
                result: json,
                step: startAtStep,
                isRunning: true,
                resetConsoleCache: false,
                isExecutingOnServer: false
            });
            this.props.onRanCode();
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
        }
        
    }


    pauseSimulation() {
        clearTimeout(timeout);
        timeout = null;
        this.setState({
            isRunning: false
        });
    }

    simulateNextStep() {
        // SAVE ENTIRE STATE DATA PER STEP (JSON LARGER BUT LESS SIMULATION ON THIS END REQUIRED, EASIER BACK AND FORTH)
        // OR SAVE CHANGES MADE ON EACH STEP (JSON SMALLER BUT HAVE TO SIMULATE ON THIS END. HAVE TO REDO OR SAVE PREVIOUS SIMULATED STATES, COULD ADD FILTER OR BREAKPOINTS)
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0 && (this.state.step+1) < this.state.result.steps.length) {
            log("step: " + this.state.step + " " + this.state.result.steps[this.state.step].valueType + " " + this.state.result.steps[this.state.step].value);
            this.props.setHighlighting({
                node: this.state.result.node_data[this.state.result.steps[this.state.step+1].id],
                step: this.state.result.steps[this.state.step+1]
            });
            this.setState({
                step: this.state.step+1,
                isRunning: true
            });
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
        } else {
            this.pauseSimulation();
        }

    }
    


    onFirstStepClick(e) {
        if (timeout !== null) {
            this.pauseSimulation();
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            this.props.setHighlighting({
                node: this.state.result.node_data[this.state.result.steps[0].id],
                step: this.state.result.steps[0]
            });
            this.setState({
                step: 0
            });
        }
    }

    onNextStepClick(e) {
        if (timeout !== null) {
            this.pauseSimulation();
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            if ((this.state.step+1) < this.state.result.steps.length) {
                this.props.setHighlighting({
                    node: this.state.result.node_data[this.state.result.steps[this.state.step+1].id],
                    step: this.state.result.steps[this.state.step+1]
                });
                this.setState({
                    step: this.state.step+1
                });
            } else {
                this.props.setHighlighting({
                    node: this.state.result.node_data[this.state.result.steps[0].id],
                    step: this.state.result.steps[0]
                });
                this.setState({
                    step: 0
                });
            }
        }
    }

    onPauseUnpauseClick(e) {
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            if (this.state.isRunning) {
                this.pauseSimulation();
            } else {
                if (this.state.step === this.state.result.steps.length-1) {
                    this.props.setHighlighting({
                        node: this.state.result.node_data[this.state.result.steps[0].id],
                        step: this.state.result.steps[0]
                    });
                    this.setState({
                        step: 0
                    });
                    timeout = setTimeout(this.simulateNextStep, this.state.delay);
                } else {
                    this.simulateNextStep();
                }
            }
        } else {
            this.runCode(); // is this user friendly?
        }
    }
    
    onSimulationSpeedChange(key, event) {
        const delay = parseInt(key);
        this.setState({
            delay: delay
        });
    }

    onPreviousStepClick(e) {
        if (timeout !== null) {
            this.pauseSimulation();
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            if ((this.state.step-1) >= 0) {
                this.props.setHighlighting({
                    node: this.state.result.node_data[this.state.result.steps[this.state.step-1].id],
                    step: this.state.result.steps[this.state.step-1]
                });
                this.setState({
                    step: this.state.step-1
                });
            } else {
                this.props.setHighlighting({
                    node: this.state.result.node_data[this.state.result.steps[this.state.result.steps.length-1].id],
                    step: this.state.result.steps[this.state.result.steps.length-1]
                });
                this.setState({
                    step: this.state.result.steps.length-1
                });
            }
        }
    }

    onLastStepClick(e) {
        if (timeout !== null) {
            this.pauseSimulation();
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            this.props.setHighlighting({
                node: this.state.result.node_data[this.state.result.steps[this.state.result.steps.length-1].id],
                step: this.state.result.steps[this.state.result.steps.length-1]
            });
            this.setState({
                step: this.state.result.steps.length-1
            });
        }
    }

}




export function Handle({ handle: { id, value, percent }, getHandleProps }) {
    return (
      <div
        style={{
          left: `${percent}%`,
          position: 'absolute',
          marginLeft: -5,
          marginTop: 5,
          zIndex: 2,
          width: 10,
          height: 30,
          border: 0,
          textAlign: 'center',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#ffffff',
        }}
        {...getHandleProps(id)}
      />
    )
}

export function Track({ source, target, getTrackProps }) {
    return (
      <div
        style={{
          position: 'absolute',
          height: 10,
          zIndex: 1,
          marginTop: 15,
          backgroundColor: '#df691a',
          borderRadius: 5,
          cursor: 'pointer',
          left: `${source.percent}%`,
          width: `${target.percent - source.percent}%`,
        }}
        {...getTrackProps()}
      />
    )
  }