import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';
import lzstring from 'lz-string';

import { Form, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'

import ExerciseContent from './content/exercise-content.component';
import ExerciseSourceFiles from './content/exercise-source-files.component';
import ExerciseExecuter from './content/exercise-executer.component';

import ProgressArrows from './progress-arrows/progress-arrows.component'

export default class ExerciseEdit extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseContent = this.onChangeExerciseContent.bind(this);
        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        this.addNewTitle = this.addNewTitle.bind(this);
        this.addNewText = this.addNewText.bind(this);
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


        this.state = {
			courseID: this.props.courseID,
			exerciseID: this.props.exerciseID,
			subExerciseIndex: 0,

			exercise: {
				name: '',
				isVisibleToStudents: true,
				subExercises: [{
					_id: 0,
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
				this.setState({
					exercise: response.data.exercise
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
            <div className="disableSelection" style={{marginTop: '60px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                
				<div style={{textAlign: "center"}}>
					<h3>Edit Exercise {this.state.exercise.name}</h3>
				</div>

				<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>
                <br />

                <Form onSubmit={this.onSubmit}>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm={3} style={{textAlign: 'right'}}><h5>Name:</h5></Form.Label>
                        <Col sm={8}>
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
                        <Form.Label column sm={3} style={{textAlign: 'right'}}><h5>Visible:</h5></Form.Label>
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
                        <Form.Label column sm={3} style={{textAlign: 'right'}}><h5>New Sub-Exercise:</h5></Form.Label>
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
							onClick={(e, i) => {
								this.setState({ subExerciseIndex: i });
							}}
							onContextMenu={(e, i) => this.deleteSubExcerise(e, i)}
						/>
					</div>

                    <br />
					<hr style={{backgroundColor: "rgb(223, 105, 26)"}}/>

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
							/>
							
							<br />
							<br />

							<Col style={{ textAlign: "center", marginBottom: "30px" }}>
								<Button variant="outline-primary" onClick={this.addNewTitle} style={{width: '150px'}}>+Title</Button>
								<Button variant="outline-primary" onClick={this.addNewText} style={{width: '150px'}}>+Text</Button>
								<Button variant="outline-primary" onClick={this.addNewCode} style={{width: '150px'}}>+Code</Button>
								<Button variant="outline-primary" onClick={this.addNewEditor} style={{width: '150px'}}>+Editor</Button>
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
                            rows="10"
                            name="ExerciseExportJSONStringTextArea"
                            defaultValue={this.state.exerciseExportJSONString}
                        />
                    }

                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}>Save</Button>
                        <Button variant="danger" onClick={this.exportExerciseAsJSON} style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}>Export</Button>
                    </Form.Group>

                </Form>
            </div>);
    }

	addNewSubExercise() {


		this.setState({
			contentIDCounter: this.state.contentIDCounter+4,
			exercise: update(this.state.exercise, {
				subExercises: {
					$push: [
						{
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
            subExerciseElements = this.array_move(this.state.exercise.subExercises[this.state.subExerciseIndex][key], index, index-1);
        } else {
            subExerciseElements = this.array_move(this.state.exercise.subExercises[this.state.subExerciseIndex][key], index, index+1);
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

    array_move(original_array, old_index, new_index) {
        let arr = original_array.slice();
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (old_index >= arr.length) {
            old_index -= arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        while (new_index >= arr.length) {
            new_index -= arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    };
    

    onChangeExerciseName(e) {
		this.setState({
			exercise: update(this.state.exercise, {
				name: {
					$set: e.target.value
				}
			})
		});
    }

    onChangeExerciseContent(e) {
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
								text: {
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
				content: content,
				sourceFiles: sourceFiles
			})
		}

        
        const data = {
			courseID: this.state.courseID,
            exerciseID: this.state.exerciseID,
			name: this.state.exercise.name,
			isVisibleToStudents: this.state.exercise.isVisibleToStudents,
			subExercises: subExercises
        }

        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/course/exercise', data)
        .then(res => {
            console.log(res.data);
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