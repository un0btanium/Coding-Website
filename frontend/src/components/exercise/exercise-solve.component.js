import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

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

        this.state = {
			courseName: "Test",
			courseID: this.props.courseID,
			exerciseID: this.props.exerciseID,
			subExerciseIndex: 0,

			exercise: {
				name: '',
				isVisibleToStudents: true,
				subExercises: [{
					id: 0,
					content: [],
					sourceFiles: []
				}]
			},
			userSubExercisesData: {},

            highlighting: null,
            didChangeCode: true
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
            <div className="disableSelection" style={{marginTop: '60px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
				
				<div  onClick={(e) => this.props.history.push("/course/" + this.state.courseID + "/exercises")}style={{textAlign: "center", cursor: "pointer", marginBottom: "20px" }}>
					<h2 className="changeTextColorOnHover">{this.state.courseName}</h2>
				</div>
				
				<div style={{textAlign: "center"}}>
                	<h3>{this.state.exercise.name}</h3>
				</div>

                <br />

				<div style={{ width: "100%", textAlign: "center"}}>
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
                <br />

                <ExerciseContent
					subExerciseIndex={this.state.subExerciseIndex}
                    content={this.state.exercise.subExercises[this.state.subExerciseIndex].content}
                    mode="solve"
                    onChangeExerciseContent={this.onChangeExerciseContent}
                    onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                    setHighlighting={this.setHighlighting}
                    highlighting={this.state.highlighting}
                />

                <br />
                <br />

                <ExerciseExecuter
					courseID={this.state.courseID}
					exerciseID={this.state.exerciseID}
					subExerciseIndex={this.state.subExerciseIndex}
					subExercise={this.state.exercise.subExercises[this.state.subExerciseIndex]}
                    didChangeCode={this.state.didChangeCode}
                    onRanCode={this.onRanCode}
					setHighlighting={this.setHighlighting}
					sendSourceFiles={false}
					largeMargin={true}
                />
            </div>
        );
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
            didChangeCode: false
        });
    }


    setHighlighting(highlighting) {
        this.setState({
            highlighting: highlighting
        });
    }

}