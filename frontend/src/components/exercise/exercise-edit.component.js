import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';
import lzstring from 'lz-string';
import { toast } from 'react-toastify';

import { Form, Button, Row, Col, Tabs, Tab, Accordion, Card } from 'react-bootstrap';

import { Slider, Rail, Handles, Tracks } from 'react-compound-slider'
import { Track } from './slider/track';
import { Handle } from './slider/handle';

import Iframe from 'react-iframe';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faDownload } from '@fortawesome/free-solid-svg-icons'

import ExerciseContent from './content/exercise-content.component';
import ExerciseSourceFiles from './content/exercise-source-files.component';
import ExerciseExecuter from './content/exercise-executer.component';

import ProgressArrows from './progress-arrows/progress-arrows.component';

import { log } from '../../services/Logger';
import { array_move } from '../../services/ArrayShifter';
import { faSave } from '@fortawesome/free-regular-svg-icons';

export default class ExerciseEdit extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseIFrame = this.onChangeExerciseIFrame.bind(this);
        this.onChangeExerciseContent = this.onChangeExerciseContent.bind(this);
        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        this.addNewTitle = this.addNewTitle.bind(this);
        this.addNewText = this.addNewText.bind(this);
        this.addNewSpoiler = this.addNewSpoiler.bind(this);
        this.addNewIFrame = this.addNewIFrame.bind(this);
        this.addNewCode = this.addNewCode.bind(this);
        this.addNewEditor = this.addNewEditor.bind(this);
        this.deleteContent = this.deleteContent.bind(this);
        this.moveContent = this.moveContent.bind(this);

        this.addNewSourceFile = this.addNewSourceFile.bind(this);
        this.deleteSourceFile = this.deleteSourceFile.bind(this);
        this.moveSourceFile = this.moveSourceFile.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
		this.exportExerciseAsJSON = this.exportExerciseAsJSON.bind(this);
		
        this.onRanCode = this.onRanCode.bind(this);
		this.setHighlighting = this.setHighlighting.bind(this);
		this.setHighlightingDetailLevelIndex = this.setHighlightingDetailLevelIndex.bind(this);
		this.setHighlightingDetailLevelIndexSubExercise = this.setHighlightingDetailLevelIndexSubExercise.bind(this);
		

        this.state = {
			courseName: this.props.courseName,
			courseID: this.props.courseID,
			exerciseID: this.props.exerciseID,
			subExerciseIndex: 0,

			exercise: {
				name: '',
				isVisibleToStudents: true,
				iFrameUrl: "",
				highlightingDetailLevelIndex: 0,
				subExercises: [{
					_id: 0,
					highlightingDetailLevelIndex: 0,
					content: [],
					sourceFiles: []
				}]
			},

            contentIDCounter: 0,
            tabKey: "content",
			exerciseExportJSONString: null,
			
            highlighting: null,
            didChangeCode: true
        }
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.state.courseID + '/exercise/' + this.state.exerciseID)
            .then(response => {
				log(response.data.exercise);
				this.setState({
					exercise: response.data.exercise,
					courseName: response.data.courseName
				});
            })
            .catch((error) => {
                console.error("Course or Exercise not found!");
				this.props.history.push('/');
            });
    }

    render () {

		if (this.state.exercise.subExercises.length === 0) {
			return null;
		}

        return (
            <div className="disableSelection fadeIn" style={{marginTop: '60px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                
				<div onClick={(e) => this.props.history.push("/course/" + this.state.courseID + "/exercises")} style={{textAlign: "center", cursor: "pointer", marginBottom: "20px" }}>
					<h2 className="changeTextColorOnHover">{this.state.courseName}</h2>
				</div>

				<div style={{textAlign: "center"}}>
					<h3>Edit Exercise {this.state.exercise.name}</h3>
				</div>

				<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>
                <br />

                <div>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={5} style={{textAlign: 'right'}}><h5>Name:</h5></Form.Label>
                        <Col sm={6}>
                            <Form.Control 
                                autoFocus
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
                                type="text"
                                className="form-control"
                                placeholder="Enter name"
                                value={this.state.exercise.name}
                                onChange={this.onChangeExerciseName}
                            />
                        </Col>
                    </Form.Group>

					<Form.Group as={Row} className="form-group">
						<Form.Label column sm={5} style={{textAlign: 'right'}}><h5>Optional IFrame:</h5></Form.Label>
						<Col sm={6}>
							<Form.Control 
								style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
								type="text"
                                plaintext="true"
								autoComplete="off"
								className="form-control"
								placeholder="Enter url of the content displayed in the iframe"
								value={this.state.exercise.iFrameUrl || ""}
								onChange={this.onChangeExerciseIFrame}
							/>
						</Col>
					</Form.Group>

					<Form.Group as={Row} className="form-group">
						<Form.Label column sm={5} style={{textAlign: 'right'}}><h5>Default Highlighting Detail Level:</h5></Form.Label>
						<Col sm={6}>
							<Slider
								mode={1}
								step={1}
								domain={[0, 5]}
								rootStyle={{position: 'relative', width: '200px', height: '40px', touchAction: 'none'}}
								onUpdate={this.setHighlightingDetailLevelIndex}
								values={[this.state.exercise.highlightingDetailLevelIndex || 0]}
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
						</Col>
					</Form.Group>
                    
					<Form.Group as={Row} className="form-group">
                        <Form.Label column sm={5} style={{textAlign: 'right'}}><h5>Visible:</h5></Form.Label>
                        <Col sm={6}>
							<Form.Check
								style={{marginTop: "10px"}} 
								id="toggleIsVisibleForStudents"
								draggable={false}
								type="checkbox"
								className="custom-switch"
								custom="true"
								label=""
								checked={this.state.exercise.isVisibleToStudents}
								onChange={(e) => {this.setState({ exercise: update(this.state.exercise, { isVisibleToStudents: { $set: !this.state.exercise.isVisibleToStudents } } ) })}}
							/>
                        </Col>
                    </Form.Group>
					
					<Form.Group as={Row} className="form-group">
                        <Form.Label column sm={5} style={{textAlign: 'right'}}><h5>New Sub-Exercise:</h5></Form.Label>
                        <Col sm={6}>
							<Button
								key="AddNewSubExercise"
								variant="success"
								onClick={(e) => this.addNewSubExercise()}
							><FontAwesomeIcon icon={faPlus} /></Button>
                        </Col>
                    </Form.Group>

					<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>
                    <br />

					<div style={{ width: "100%", textAlign: "center"}}>
						<ProgressArrows
							arrows={this.state.exercise.subExercises}
							current={this.state.exercise.subExercises[this.state.subExerciseIndex]._id}
							onClick={(e, i) => {
								this.setState({ subExerciseIndex: i });
							}}
							onContextMenu={(e, i) => this.deleteSubExcerise(e, i)}
						/>
					</div>


					{
						(this.state.exercise.iFrameUrl && this.state.exercise.iFrameUrl !== "") && 
						
							<>
								<br />
								<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>
								<br />
								<Accordion style={{'marginBottom': '20px', width: "100%", boxShadow: '2px 2px 5px #000000'}} className="disableSelection" defaultActiveKey="0">
									<Accordion.Toggle as={Card.Header} eventKey="0" style={{textAlign: "center"}}>Show/Hide Presentation</Accordion.Toggle>
									<Accordion.Collapse eventKey="0" style={{backgroundColor: "#666666"}}>
										<Iframe url={this.state.exercise.iFrameUrl}
											width="100%"
											height="530px"
											allowFullScreen="true"
											mozallowfullscreen="true"
											webkitallowfullscreen="true"
											frameBorder="0"
										/>
									</Accordion.Collapse>
								</Accordion>
							</>
					}

                    <br />
					<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>
                    <br />

                    <Tabs
						style={{width: "100%"}}
                        id="controlled-tab-exercise"
                        activeKey={this.state.tabKey}
						onSelect={(tabKey) => this.setState({ tabKey })}
                    >
                        <Tab variant="primary" eventKey="content" title="Content Elements">
							<ExerciseContent
								subExerciseIndex={this.state.subExerciseIndex}
								content={this.state.exercise.subExercises[this.state.subExerciseIndex].content}
								mode="edit"
								onChangeExerciseContent={this.onChangeExerciseContent}
								onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
								deleteContent={this.deleteContent}
								moveContent={this.moveContent}
								setHighlighting={this.setHighlighting}
								highlighting={this.state.highlighting}
								isSolved={false}
							/>
							
							<br />
							<br />

							<Col style={{ textAlign: "center", marginBottom: "30px" }}>
								<Button variant="outline-primary" onClick={this.addNewTitle} style={{width: '125px'}}>+Title</Button>
								<Button variant="outline-primary" onClick={this.addNewText} style={{width: '125px'}}>+Text</Button>
								<Button variant="outline-primary" onClick={this.addNewSpoiler} style={{width: '125px'}}>+Spoiler</Button>
								<Button variant="outline-primary" onClick={this.addNewIFrame} style={{width: '125px'}}>+IFrame</Button>
								<Button variant="outline-primary" onClick={this.addNewCode} style={{width: '125px'}}>+Code</Button>
								<Button variant="outline-primary" onClick={this.addNewEditor} style={{width: '125px'}}>+Editor</Button>
							</Col>

							<ExerciseExecuter
								courseID={this.state.courseID}
								exerciseID={this.state.exerciseID}
								subExerciseIndex={this.state.subExerciseIndex}
								subExercise={this.state.exercise.subExercises[this.state.subExerciseIndex]}
								didChangeCode={this.state.didChangeCode}
								onRanCode={this.onRanCode}
								setHighlighting={this.setHighlighting}
								sendSourceFiles={true}
								largeMargin={false}
								setHighlightingDetailLevelIndex={this.setHighlightingDetailLevelIndexSubExercise}
								isSolved={true}
							/>
						</Tab>
                        <Tab variant="primary" eventKey="source-file" title="Source Files">
							<ExerciseSourceFiles
								mode="edit"
								sourceFiles={this.state.exercise.subExercises[this.state.subExerciseIndex].sourceFiles}
								onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
								deleteSourceFile={this.deleteSourceFile}
								moveSourceFile={this.moveSourceFile}
							/>
							
							<br />
							<br />

							<Form.Group as={Row} className="form-group">
								<Col style={{ textAlign: "center" }}>
									<Button variant="outline-primary" onClick={this.addNewSourceFile} style={{width: '150px'}}>+Source File</Button>
								</Col>
							</Form.Group>
						</Tab>

					</Tabs>

                    <br />
                    <br />

                    {this.state.exerciseExportJSONString &&
                       <Form.Control
                            style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                            plaintext="true"
                            autoComplete="off"
                            as="textarea"
                            rows="3"
                            name="ExerciseExportJSONStringTextArea"
                            defaultValue={this.state.exerciseExportJSONString}
                        />
                    }

                    <Form.Group className="form-group">
                        <Button variant="success" onClick={this.onSubmit} style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}><FontAwesomeIcon icon={faSave} /> Save</Button>
                        <Button variant="danger" onClick={this.exportExerciseAsJSON} style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}><FontAwesomeIcon icon={faDownload} /> Export</Button>
                    </Form.Group>

				</div>
            </div>);
	}
	

	setHighlightingDetailLevelIndex(highlightingDetailLevelIndex) {
		if (this.state.exercise.highlightingDetailLevelIndex !== highlightingDetailLevelIndex[0]) {
			this.setState({
				didChangeCode: true,
				exercise: update(this.state.exercise, {
					highlightingDetailLevelIndex: {
						$set: highlightingDetailLevelIndex[0]
					}
				})
			});
		}
	}

	setHighlightingDetailLevelIndexSubExercise(highlightingDetailLevelIndex) {
		if (this.state.exercise.subExercises[this.state.subExerciseIndex].highlightingDetailLevelIndex !== highlightingDetailLevelIndex[0]) {
			this.setState({
				didChangeCode: true,
				exercise: update(this.state.exercise, {
					subExercises: {
						[this.state.subExerciseIndex]: {
							highlightingDetailLevelIndex: {
								$set: highlightingDetailLevelIndex[0]
							}
						}
					}
				})
			});
		}
	}

	addNewSubExercise() {
		this.setState({
			contentIDCounter: this.state.contentIDCounter+4,
			exercise: update(this.state.exercise, {
				subExercises: {
					$push: [
						{
							highlightingDetailLevelIndex: this.state.exercise.highlightingDetailLevelIndex,
							content: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "title",
									text: ""
								},
								{
									_id: "NEW " + this.state.contentIDCounter+1,
									type: "text",
									text: ""
								},
								{
									_id: "NEW " + this.state.contentIDCounter+2,
									type: "editor",
									identifier: "main_method_body",
									code: "",
									solution: "",
									settings: {
										minLines: 5
									}
								}
							],
							sourceFiles: [{
								_id: "NEW " + this.state.contentIDCounter+3,
								package: "main",
								name: "Main",
								code: "package main;\n" + 
								"\n" + 
								"import java.util.*;\n" + 
								"import java.io.*;\n" + 
								"import java.math.*;\n" + 
								"\n" + 
								"import java.io.Console;\n" + 
								"\n" + 
								"public class Main {\n" + 
								"    \n" + 
								"    public static void main(String[] args) {\n" + 
								"// main_method_body\n" + 
								"    }\n" + 
								"    \n" + 
								"}"
							}]
						}
					]
				}
			})
		})
	}

	deleteSubExcerise(e, index) {
		e.preventDefault();

		if (this.state.exercise.subExercises.length === 1) {
			return;
		}

		let subExerciseIndex = this.state.subExerciseIndex;
		if (this.state.subExerciseIndex === index && this.state.subExerciseIndex !== 0) {
			subExerciseIndex = this.state.subExerciseIndex-1;
		}
		subExerciseIndex = Math.min(subExerciseIndex, this.state.exercise.subExercises.length-2);

		toast(<div style={{textAlign: "center"}}>Removed Sub-Exercise!<br/>Save to persist!</div>, {type: toast.TYPE.INFO, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})

        this.setState({
			subExerciseIndex: subExerciseIndex,
			exercise: update(this.state.exercise, {
				subExercises: {
					$splice: [[index, 1]]
				}
			})
        });
	}

    addNewSourceFile() {
        if (this.state.exercise.subExercises[this.state.subExerciseIndex].sourceFiles.length === 0) {
            this.setState({
				contentIDCounter: this.state.contentIDCounter+1,
				didChangeCode: true,
				exercise: update(this.state.exercise, {
					subExercises: {
						[this.state.subExerciseIndex]: {
							sourceFiles: {
								$push: [
									{
										_id: "NEW " + this.state.contentIDCounter,
										package: "main",
										name: "Main",
										code: "package main;\n" + 
										"\n" + 
										"import java.util.*;\n" + 
										"import java.io.*;\n" + 
										"import java.math.*;\n" + 
										"\n" + 
										"import java.io.Console;\n" + 
										"\n" + 
										"public class Main {\n" + 
										"    \n" + 
										"    public static void main(String[] args) {\n" + 
										"// main_method_body\n" + 
										"    }\n" + 
										"    \n" + 
										"}"
									}
								]
							}
						}
					}
				})
            });
        } else {
            this.setState({
				contentIDCounter: this.state.contentIDCounter+1,
				didChangeCode: true,
				exercise: update(this.state.exercise, {
					subExercises: {
						[this.state.subExerciseIndex]: {
							sourceFiles: {
								$push: [
									{
										_id: "NEW " + this.state.contentIDCounter,
										package: "main",
										name: "",
										code: "package main;\n" + 
										"\n" + 
										"import java.util.*;\n" + 
										"import java.io.*;\n" + 
										"import java.math.*;\n" + 
										"\n" + 
										"import java.io.Console;\n" + 
										"\n"
									}
								]
							}
						}
					}
				})
            });
        }
    }

    addNewTitle() {
        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "title",
									text: ""
								}
							]
						}
					}
				}
			})
        });
    }

    addNewText() {
        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "text",
									text: ""
								}
							]
						}
					}
				}
			})
        });
	}
	
    addNewSpoiler() {
        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "spoiler",
									text: "",
									title: ""
								}
							]
						}
					}
				}
			})
        });
    }
	
    addNewIFrame() {
        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "iframe",
									text: "",
								}
							]
						}
					}
				}
			})
        });
    }

    addNewCode() {
        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "code",
									code: "",
									settings: {
										minLines: 1
									}
								}
							]
						}
					}
				}
			})
        });
    }

    addNewEditor() {
        let identifier = "";

        let containsEditor = false;
        for (let element of this.state.exercise.subExercises[this.state.subExerciseIndex].content) {
            if (element.type === "editor") {
                containsEditor = true;
                break;
            }
        }

        if (!containsEditor) {
            identifier = "main_method_body";
        }

        this.setState({
			contentIDCounter: this.state.contentIDCounter+1,
			didChangeCode: true,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$push: [
								{
									_id: "NEW " + this.state.contentIDCounter,
									type: "editor",
									identifier: identifier,
									code: "",
									solution: "",
									settings: {
										minLines: 5
									}
								}
							]
						}
					}
				}
			})
        });
    }



    deleteContent(id) {
		let index = -1;
		let i = 0;
		for (let c of this.state.exercise.subExercises[this.state.subExerciseIndex].content) {
			if (c._id === id) {
				index = i;
				break;
			}
			i++;
		}

		if (index === -1) {
			return;
		}

		
		toast(<div style={{textAlign: "center"}}>Removed {this.state.exercise.subExercises[this.state.subExerciseIndex].content[index].type} Entry!<br/>Save to persist!</div>, {type: toast.TYPE.INFO, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})


        this.setState({
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							$splice: [[index, 1]]
						}
					}
				}
			})
		});
    }

    
    deleteSourceFile(id) {

		let index = -1;
		let i = 0;
		for (let sourceFile of this.state.exercise.subExercises[this.state.subExerciseIndex].sourceFiles) {
			if (sourceFile._id === id) {
				index = i;
				break;
			}
			i++;
		}

		if (index === -1) {
			return;
		}

        this.setState({
			didChangeCode: true,
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						sourceFiles: {
							$splice: [[index, 1]]
						}
					}
				}
			})
        });
    }



    moveContent(id, moveUp) {
		this.moveSubExerciseElements(id, moveUp, "content");
    }

    moveSourceFile(id, moveUp) {
		this.moveSubExerciseElements(id, moveUp, "sourceFiles");
	}
	
	moveSubExerciseElements(id, moveUp, key) {
		let index;
		if (key === "sourceFiles") {
			index = this.getIndexOfSourceFile(id);
		} else if (key === "content") {
			index = this.getIndexOfContent(id);
		} else {
			return;
		}

        if (index === -1) {
            return;
        }

		let subExerciseElements;
        if (moveUp) {
            subExerciseElements = array_move(this.state.exercise.subExercises[this.state.subExerciseIndex][key], index, index-1);
        } else {
            subExerciseElements = array_move(this.state.exercise.subExercises[this.state.subExerciseIndex][key], index, index+1);
		}
		
		this.setState({
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						[key]: {
							$set: subExerciseElements
						}
					}
				}
			})
		});
	}



    onChangeExerciseName(e) {
		this.setState({
			exercise: update(this.state.exercise, {
				name: {
					$set: e.target.value
				}
			})
		});
	}
	
	onChangeExerciseIFrame(e) {
		this.setState({
			exercise: update(this.state.exercise, {
				iFrameUrl: {
					$set: e.target.value
				}
			})
		});
	}

    onChangeExerciseContent(e, key) {
		key = key || "text";
        let index = this.getIndexOfContent(e.target.name);

        if (index === -1) {
            console.error("No exercise content found!");
            return;
		}
		
		this.setState({
			exercise: update(this.state.exercise, {
				subExercises: {
					[this.state.subExerciseIndex]: {
						content: {
							[index]: {
								[key]: {
									$set: e.target.value
								}
							}
						}
					}
				}
			})
		});
    }

    onChangeExerciseAceEditor(e, value, id, key, keySettings) {
        key = key || "code"; // code, solution, identifier, package, name, settings (minLines)

        let index = this.getIndexOfContent(id);

        if (index === -1) {
            index = this.getIndexOfSourceFile(id);
            if (index === -1) {
                console.error("No exercise content found!");
                return;
            } else {
				this.setState({
					didChangeCode: true,
					exercise: update(this.state.exercise, {
						subExercises: {
							[this.state.subExerciseIndex]: {
								sourceFiles: {
									[index]: {
										[key]: {
											$set: value
										}
									}
								}
							}
						}
					})
				});
            }
        } else {
            if (key === "settings") {
				this.setState({
					exercise: update(this.state.exercise, {
						subExercises: {
							[this.state.subExerciseIndex]: {
								content: {
									[index]: {
										settings: {
											[keySettings]: {
												$set: value
											}
										}
									}
								}
							}
						}
					})
				});
            } else {
				this.setState({
					didChangeCode: (key === "code" || key === "solution" ? true : this.state.didChangeCode),
					exercise: update(this.state.exercise, {
						subExercises: {
							[this.state.subExerciseIndex]: {
								content: {
									[index]: {
										[key]: {
											$set: value
										}
									}
								}
							}
						}
					})
				});
            }
        }
    }

    getIndexOfContent(id) {
        let index = -1;
        let i = 0;
        for (let currentContent of this.state.exercise.subExercises[this.state.subExerciseIndex].content) {
            if (currentContent._id === id) {
                index = i;
                break;
            }
            i++;
        }
        return index;
    }

    getIndexOfSourceFile(id) {
        let index = -1;
        let i = 0;
        for (let currentSourceFile of this.state.exercise.subExercises[this.state.subExerciseIndex].sourceFiles) {
            if (currentSourceFile._id === id) {
                index = i;
                break;
            }
            i++;
        }
        return index;
    }



    
    exportExerciseAsJSON() {

		let exerciseCopy = {...this.state.exercise};
		delete exerciseCopy._id;
		exerciseCopy.subExercises = [];
		for (let originalSubExercise of this.state.exercise.subExercises) {
			let subExercise = {...originalSubExercise};
			delete subExercise._id;

			let newContent = [];
			for (let c of subExercise.content) {
				let contentCopy = {...c};
				delete contentCopy._id;
				newContent.push(contentCopy);
			}

			let newSourceFiles = [];
			for (let sourceFile of subExercise.sourceFiles) {
				let sourceFileCopy = {...sourceFile};
				delete sourceFileCopy._id;
				newSourceFiles.push(sourceFileCopy);
			}

			subExercise.content = newContent;
			subExercise.sourceFiles = newSourceFiles;

			exerciseCopy.subExercises.push(subExercise)
		}
		
        let exercise = JSON.stringify(exerciseCopy);
		
        this.setState({
            exerciseExportJSONString: lzstring.compressToBase64(exercise)
        });
    }

    
    onSubmit(e) {
        e.preventDefault();

        if (this.state.exercise.name === '') {
            return;
        }

		let subExercises = [];
        for (let subExercise of this.state.exercise.subExercises) {
			// removes id from new content entries so that the database gives it an accual id
			const content = subExercise.content.map(function(currentContent) {
				if (currentContent._id.startsWith("NEW ")) {
					delete currentContent["_id"];
				}
				return currentContent;
			});
			const sourceFiles = subExercise.sourceFiles.map(function(sourceFile) {
				if (sourceFile._id.startsWith("NEW ")) {
					delete sourceFile["_id"];
				}
				return sourceFile;
			});

			subExercises.push({
				_id: subExercise._id,
				highlightingDetailLevelIndex: subExercise.highlightingDetailLevelIndex || 0,
				content: content,
				sourceFiles: sourceFiles
			})
		}

        
        const data = {
			courseID: this.state.courseID,
            exerciseID: this.state.exerciseID,
			name: this.state.exercise.name,
			isVisibleToStudents: this.state.exercise.isVisibleToStudents,
			iFrameUrl: this.state.exercise.iFrameUrl || "",
			highlightingDetailLevelIndex: this.state.exercise.highlightingDetailLevelIndex || 0,
			subExercises: subExercises
		}

        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/exercise', data)
        .then(res => {
            console.log(res.data);
			toast(<div style={{textAlign: "center"}}>Exercise saved!</div>, {type: toast.TYPE.SUCCESS, autoClose: 3000, draggable: false, hideProgressBar: true, closeButton: false, newestOnTop: true})	
            this.props.setModeToSolve();
		})
		.catch((error) => {
			// TODO show error modal
		})
	}
	
	
    onRanCode() {
        this.setState({
            didChangeCode: false
        });
    }


    setHighlighting(highlighting) {
        this.setState({
            highlighting: highlighting
        });
    }
    
}