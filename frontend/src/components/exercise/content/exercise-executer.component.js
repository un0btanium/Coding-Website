import React, {Component} from 'react';
import Axios from 'axios';

import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';
import { Track } from '../slider/track';
import { Handle } from '../slider/handle';

import { Row,  ButtonGroup, DropdownButton, Dropdown, Button, ProgressBar, OverlayTrigger, Popover } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFastBackward, faStepBackward, faPlay, faPause, faStepForward, faFastForward, faSpinner } from '@fortawesome/free-solid-svg-icons';

import ExerciseConsole from './exercise-console.component';
import ExerciseHTMLGUI from './exercise-htmlgui.component';

import { log, logError } from '../../../services/Logger';
import lzstring from 'lz-string';

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
			ranSubExerciseIndex: 0,
            isExecutingOnServer: false,
            result: null,
            step: 0,
            delay: 128,
            isRunning: false,

            resetConsoleCache: false,
			containsReadIn: false,

			codeType: "code"
        }
    }

    componentWillUnmount() {
        clearTimeout(timeout);
    }

    render () {

        let progressBar = null;
        if (this.state.result && this.state.result.steps) {
            progressBar = <ProgressBar style={{height: '10px' }} min={0} max={this.state.result.steps.length} now={this.state.step+1} label={(this.state.step+1) + "/" + this.state.result.steps.length}></ProgressBar>;
        } else {
            // progressBar = <div style={{height: '10px', backgroundColor: '#4e5d6d'}}></div>
        }
        
		let runCodeButton = <>
			<Button
				style={{width: this.props.isSolved ?'190px':'230px'}}
				variant="success" onClick={(e) => this.runCode(e, "code")}
			>
				Run Code <FontAwesomeIcon style={{float: 'right', marginTop: '4px'}} icon={faPlay} />
			</Button>
			{ 
				this.props.isSolved && 
				<OverlayTrigger
                        key="tooltipOverlayHighlighting"
                        placement="top"
                        delay={{'show': 0, 'hide': 128}}
                        overlay={
                            <Popover
                                style={{ padding: '15px',background: 'rgba(0,0,0, 0.8)', backgroundColor: 'rgba(0,0,0, 0.8)', textAlign: 'left', wordBreak: 'keep-all', whiteSpace: 'pre'}}
                                // arrowProps={style="{{background: 'rgba(0,0,0, 0.8)'}}"}
                                id="tooltipRunSolutionButton"
                            >
								<b>Run Solution</b>
							</Popover>
                        }
                    >
						<Button
							style={{width: '41px'}}
							variant="warning" onClick={(e) => this.runCode(e, "solution")}
						>
							<FontAwesomeIcon icon={faPlay} />
						</Button>
                    </OverlayTrigger>
			}
		</>
		
		if (this.state.isExecutingOnServer) {
            runCodeButton = <Button style={{width: '230px'}} variant="success" onClick={this.onChange} ><span><FontAwesomeIcon style={{ 'marginRight': '12px'}} icon={faSpinner} pulse={true} size="lg" />Running...</span></Button>
        } else if (this.state.result && (this.state.result.isGuiReadIn || this.state.result.isReadIn)) {
            runCodeButton = <Button style={{width: '230px'}} variant="success" onClick={this.onChange} ><span><FontAwesomeIcon style={{ 'marginRight': '12px'}} icon={faSpinner} pulse={true} size="lg" />Waiting for User Input...</span></Button>
        }


        let consoleComponent = 
            <ExerciseConsole
                result={this.state.result}
                step={this.state.step}
                onConsoleInput={this.onConsoleInput}
                resetConsoleCache={this.state.resetConsoleCache}
            />

        let HTMLGUIComponent = 
            <ExerciseHTMLGUI
                result={this.state.result}
                step={this.state.step}
                onConsoleInput={this.onConsoleInput}
            />

        let hud = 
            <div>
                <div style={{margin: '10px'}}>
                    <ButtonGroup style={{float: 'left'}}>
                        <Slider
                            mode={1}
                            step={1}
                            domain={[0, 5]}
                            rootStyle={{position: 'relative', width: '200px', height: '40px', touchAction: 'none'}}
                            onUpdate={this.props.setHighlightingDetailLevelIndex}
                            values={[this.props.subExercise.highlightingDetailLevelIndex || 0]}
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
                    <ButtonGroup style={{marginLeft: '14%'}}>
                        <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onFirstStepClick}><FontAwesomeIcon icon={faFastBackward} /></Button>
                        <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onPreviousStepClick}><FontAwesomeIcon icon={faStepBackward} /></Button>
                        <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onPauseUnpauseClick}>{this.state.isRunning ? <FontAwesomeIcon icon={faPause} /> : <FontAwesomeIcon icon={faPlay} />}</Button>
                        <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onNextStepClick}><FontAwesomeIcon icon={faStepForward} /></Button>
                        <Button style={{width: '40px'}} bg={BG} variant={VARIANT} onClick={this.onLastStepClick}><FontAwesomeIcon icon={faFastForward} /></Button>
                    </ButtonGroup>
                    <ButtonGroup style={{float: 'right'}}>
						<DropdownButton bg={BG} variant="success" onChange={this.onSimulationSpeedChange} id="dropdown-speed-button" title="">
							<Dropdown.Header>Simulation Speed</Dropdown.Header>
							<Dropdown.Divider />
							<Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 32 ? true : false} eventKey="32">32ms</Dropdown.Item>
							<Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 64 ? true : false} eventKey="64">64ms</Dropdown.Item>
							<Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 128 ? true : false} eventKey="128">128ms</Dropdown.Item>
							<Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 256 ? true : false} eventKey="256">256ms</Dropdown.Item>
							<Dropdown.Item onSelect={this.onSimulationSpeedChange} active={this.state.delay === 512 ? true : false} eventKey="512">512ms</Dropdown.Item>
						</DropdownButton>
                        {runCodeButton}
                    </ButtonGroup>
                </div>
                {progressBar}
                {consoleComponent}
                {HTMLGUIComponent}
            </div>
        
        
        let hudWrapper =
            <div className="disableSelection" as={Row} style={{ position: 'sticky', zIndex: '10', bottom: '-8px', backgroundColor: '#2b3e50', borderColor: '#df691a', borderRadius: '0px', borderWidth: '8px', borderStyle: 'solid', boxShadow: '2px 2px 5px #000000'}}>
                {hud}
            </div>
        
        return (
            <>
            {hudWrapper}
            <div style={{marginBottom: this.props.largeMargin ? '500px' : '50px' }}>
            </div>
            </>
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

        if (this.state.result) {
            let type = this.state.result.steps[this.state.step].type;
            if (type && type === "htmlGui" && this.state.step !== this.state.result.steps.length-1) {
                return; // prevent sending data when on wrong gui step
            }
        }

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
            isExecutingOnServer: true,
            containsReadIn: true
        });

        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/input', data, options)
            .then(response => {
                if (response.status === 200) {
                    log(response);
                    this.saveCodeResponse(response.data.compressedJson, this.state.result.steps.length-1);
                } else {
                    log(response);
                    // TODO stop code execution because something went wrong
                }
            })
            .catch((error) => {
                logError(error);
                this.setState({
					result: null
                });
            })
            .finally(() => {
                this.setState({
                    isExecutingOnServer: false
                });
            });
    }



    runCode(e, codeType) {

		codeType = codeType || "code";

        if (this.state.isExecutingOnServer) { // TODO allow to stop it if the button is pressed a second time? show stop icon and ask for confirmation?
            return;
        }

        if (!this.props.didChangeCode && !this.state.containsReadIn && this.state.ranSubExerciseIndex === this.props.subExerciseIndex && this.state.codeType === codeType) {
            this.props.setHighlighting({
				subExerciseIndex: this.state.ranSubExerciseIndex,
                node: this.state.result.node_data[this.state.result.steps[0].id],
				step: this.state.result.steps[0],
                codeType: this.state.codeType,
                currentStep: 0
            });
            this.setState({
                step: 0
            });
            if (timeout !== null) {
                this.pauseSimulation();
            }
            timeout = setTimeout(this.simulateNextStep, this.state.delay + 64);
            log("Rerun code!");
            return;
        }

        let code_snippets = {};
        for (let currentContent of this.props.subExercise.content) {
            if (currentContent.type === "editor") {
                code_snippets[currentContent.identifier] = {
                    code: currentContent[codeType]
                }
            }
        }

        let data = {
			courseID: this.props.courseID,
			exerciseID: this.props.exerciseID,
			subExerciseIndex: this.props.subExerciseIndex,
			subExerciseID: this.props.subExercise._id,
			sourceFiles: (this.props.sendSourceFiles ? this.props.subExercise.sourceFiles : undefined),
			code_snippets: code_snippets,
			highlightingDetailLevelIndex: this.props.subExercise.highlightingDetailLevelIndex || 0,
			persistCode: codeType === "code" && !this.props.sendSourceFiles
		};

        log(data);
        
        let options = {
            timeout: 120*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };
        
        this.setState({
			isExecutingOnServer: true,
			ranSubExerciseIndex: this.props.subExerciseIndex,
			codeType: codeType
        });

        Axios.post(process.env.REACT_APP_BACKEND_SERVER + '/exercise/run', data, options)
            .then(response => {
                if (response.status === 200) {
                    this.saveCodeResponse(response.data.compressedJson, 0);
                }
            })
            .catch(function (error) {
                logError(error);
            })
            .finally(() => {
                this.setState({
                    isExecutingOnServer: false,
                    containsReadIn: false
                });
            });
    }

    saveCodeResponse(compressedJson, startAtStep) {
        let json = null;

        if (compressedJson) {
            try {
                json = JSON.parse(lzstring.decompressFromBase64(compressedJson));
            } catch (e) {
                logError(e);
                return;
            }
        } else {
            logError("No json as response available!");
            return;
        }

        log(json);

        if (json && json.steps && json.steps.length > 0) {
            if (timeout !== null) {
                this.pauseSimulation();
            }
            if (startAtStep === 0) {
                this.setState({
                    resetConsoleCache: true,
                    step: 0
                });
			}
			setTimeout(
				() => {
					this.props.setHighlighting({
						subExerciseIndex: this.state.ranSubExerciseIndex,
						node: json.node_data[json.steps[startAtStep].id],
						step: json.steps[startAtStep],
						codeType: this.state.codeType,
                        currentStep: startAtStep
					});
					this.setState({
						result: json,
						step: startAtStep,
						isRunning: true,
						resetConsoleCache: false
					});
					this.props.onRanCode();
					timeout = setTimeout(this.simulateNextStep, this.state.delay + (startAtStep === 0 ? 64 : 0));
				}, 16
			);
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
				subExerciseIndex: this.state.ranSubExerciseIndex,
                node: this.state.result.node_data[this.state.result.steps[this.state.step+1].id],
                step: this.state.result.steps[this.state.step+1],
				codeType: this.state.codeType,
                currentStep: this.state.step+1
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
				subExerciseIndex: this.state.ranSubExerciseIndex,
                node: this.state.result.node_data[this.state.result.steps[0].id],
                step: this.state.result.steps[0],
				codeType: this.state.codeType,
                currentStep: 0
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
					subExerciseIndex: this.state.ranSubExerciseIndex,
                    node: this.state.result.node_data[this.state.result.steps[this.state.step+1].id],
                    step: this.state.result.steps[this.state.step+1],
					codeType: this.state.codeType,
                    currentStep: this.state.step+1
                });
                this.setState({
                    step: this.state.step+1
                });
            } else {
                this.props.setHighlighting({
					subExerciseIndex: this.state.ranSubExerciseIndex,
                    node: this.state.result.node_data[this.state.result.steps[0].id],
                    step: this.state.result.steps[0],
					codeType: this.state.codeType,
                    currentStep: 0
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
						subExerciseIndex: this.state.ranSubExerciseIndex,
                        node: this.state.result.node_data[this.state.result.steps[0].id],
                        step: this.state.result.steps[0],
						codeType: this.state.codeType,
                        currentStep: 0
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
            this.runCode();
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
					subExerciseIndex: this.state.ranSubExerciseIndex,
                    node: this.state.result.node_data[this.state.result.steps[this.state.step-1].id],
                    step: this.state.result.steps[this.state.step-1],
					codeType: this.state.codeType,
                    currentStep: this.state.step-1
                });
                this.setState({
                    step: this.state.step-1
                });
            } else {
                this.props.setHighlighting({
					subExerciseIndex: this.state.ranSubExerciseIndex,
                    node: this.state.result.node_data[this.state.result.steps[this.state.result.steps.length-1].id],
                    step: this.state.result.steps[this.state.result.steps.length-1],
					codeType: this.state.codeType,
                    currentStep: this.state.step-1
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
				subExerciseIndex: this.state.ranSubExerciseIndex,
                node: this.state.result.node_data[this.state.result.steps[this.state.result.steps.length-1].id],
                step: this.state.result.steps[this.state.result.steps.length-1],
				codeType: this.state.codeType,
                currentStep: this.state.result.steps.length-1
            });
            this.setState({
                step: this.state.result.steps.length-1
            });
        }
    }

}