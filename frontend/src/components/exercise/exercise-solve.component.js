import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

import Iframe from 'react-iframe';

import { Accordion, Card, Form } from 'react-bootstrap';

import ExerciseContent from './content/exercise-content.component';
import ExerciseExecuter from './content/exercise-executer.component';

import ProgressArrows from './progress-arrows/progress-arrows.component'

export default class ExerciseSolve extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        this.onRanCode = this.onRanCode.bind(this);
		this.setHighlighting = this.setHighlighting.bind(this);
		
		this.setHighlightingDetailLevelIndexSubExercise = this.setHighlightingDetailLevelIndexSubExercise.bind(this);

		this.onChangeEditorTheme = this.onChangeEditorTheme.bind(this);

        this.state = {
			courseName: this.props.courseName,
			courseID: this.props.courseID,
			exerciseID: this.props.exerciseID,
			subExerciseIndex: 0,

			exercise: {
				name: "Loading...",
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
			userSubExercisesData: {
				0: {
					solved: false
				}
			},

            highlighting: null,
			didChangeCode: true,
			
			isEditorInLightTheme: false
        }
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.state.courseID + '/exercise/' + this.state.exerciseID)
            .then(response => {

				let exercise = response.data.exercise;
				for (let subExercise of exercise.subExercises) {
					for (let content of subExercise.content) {
						if (content.type === "editor" && response.data.userSubExercisesData[subExercise._id] && response.data.userSubExercisesData[subExercise._id].codeSnippets[content.identifier] && response.data.userSubExercisesData[subExercise._id].codeSnippets[content.identifier].code) {
							content.code = response.data.userSubExercisesData[subExercise._id].codeSnippets[content.identifier].code;
						}
					}
				}

				this.setState({
					exercise: exercise,
					courseName: response.data.courseName,
					userSubExercisesData: response.data.userSubExercisesData
				});
            })
            .catch((error) => {
				console.log(error)
                console.error("Course or Exercise not found!");
				this.props.history.push('/');
            });
    }

    render () {

		if (this.state.exercise.subExercises.length === 0) {
			return null;
		}

        return (
            <div className="disableSelection fadeIn" style={{marginTop: '30px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>

				<div  onClick={(e) => this.props.history.push("/course/" + this.state.courseID + "/exercises")}style={{textAlign: "center", cursor: "pointer", marginBottom: "20px" }}>
					<h2 className="changeTextColorOnHover">{this.state.courseName}</h2>
				</div>
				
				<div style={{textAlign: "center"}}>
                	<h3>{this.state.exercise.name}</h3>
				</div>

				<div style={{ width: "100%", marginTop: "30px", textAlign: "center"}}>
					<ProgressArrows
						arrows={this.state.exercise.subExercises}
						data={this.state.userSubExercisesData}
						current={this.state.exercise.subExercises[this.state.subExerciseIndex]._id}
						onClick={(e, i) => {
							this.setState({ subExerciseIndex: i });
						}}
					/>
				</div>

                <br />
                <br />

				{
					(this.state.exercise.iFrameUrl && this.state.exercise.iFrameUrl !== "") && 
					
						<Accordion style={{'marginBottom': '5px', width: "100%", boxShadow: '2px 2px 5px #000000'}} className="disableSelection" defaultActiveKey="0">
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
				}
				

                <br />
				<br />



                <ExerciseContent
					subExerciseIndex={this.state.subExerciseIndex}
                    content={this.state.exercise.subExercises[this.state.subExerciseIndex].content}
					mode="solve"
					isEditorInLightTheme={this.state.isEditorInLightTheme}
                    onChangeExerciseContent={this.onChangeExerciseContent}
                    onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                    setHighlighting={this.setHighlighting}
                    highlighting={this.state.highlighting}
					isSubExerciseSolved={this.isCurrentSubExerciseSolved()}
                />

                <br />
                <br />

                <ExerciseExecuter
					courseID={this.state.courseID}
					exerciseID={this.state.exerciseID}
					subExerciseIndex={this.state.subExerciseIndex}
					subExercise={this.state.exercise.subExercises[this.state.subExerciseIndex]}
					isSolved={this.isCurrentSubExerciseSolved()}
                    didChangeCode={this.state.didChangeCode}
                    onRanCode={this.onRanCode}
					setHighlighting={this.setHighlighting}
					sendSourceFiles={false}
					largeMargin={true}
					setHighlightingDetailLevelIndex={this.setHighlightingDetailLevelIndexSubExercise}
                />

                <br />
                <br />

				<div className="disableSelection">
					<Form.Check draggable={false} id="modeToggleEditorStyle" type="checkbox" className="custom-switch" custom="true" label="Editor Light Theme" checked={this.state.isEditorInLightTheme} onChange={this.onChangeEditorTheme} />
				</div>

            </div>
        );
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


    onChangeExerciseAceEditor(e, value, id, key) {
        key = key || "code"; // code, solution, identifier, package, name

        let index = this.getIndexOfContent(id);

        if (index >= 0 && key === "code") {
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
            if (key === "code" || key === "solution") {
                this.setHighlighting(null);
            }
        }
    }

	onChangeEditorTheme(e) {
		this.setState({
            isEditorInLightTheme: e.target.checked
		});
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

    onRanCode() {
        this.setState({
			didChangeCode: false,
			userSubExercisesData: update(this.state.userSubExercisesData, {
				[this.state.exercise.subExercises[this.state.subExerciseIndex]._id]: {
					$set: {
						solved: true
					}
				}
			})
        });
    }


    setHighlighting(highlighting) {
        this.setState({
            highlighting: highlighting
        });
	}
	
	getCurrentSubExerciseUserData() {
		if (this.state.userSubExercisesData === {} || this.state.userSubExercisesData[this.state.exercise.subExercises[this.state.subExerciseIndex]] === undefined) {
			return {};
		}
		return this.state.userSubExercisesData[this.state.exercise.subExercises[this.state.subExerciseIndex]._id];
	}

	isCurrentSubExerciseSolved() {
		let data = this.state.userSubExercisesData[this.state.exercise.subExercises[this.state.subExerciseIndex]._id];
		if (this.state.userSubExercisesData === {} || data === undefined || data.solved === undefined) {
			return false;
		}
		return data.solved;
	}

}