import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

import ExerciseContent from './content/exercise-content.component';
import ExerciseExecuter from './content/exercise-executer.component';


export default class ExerciseSolve extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        this.onRanCode = this.onRanCode.bind(this);
        this.setHighlighting = this.setHighlighting.bind(this);

        this.state = {
			courseID: this.props.courseID,
            exerciseID: this.props.exerciseID,
			name: '',
			subExercises: [{
				content: [],
				sourceFiles: []
			}],
			subExerciseIndex: 0,
            highlighting: null,

            didChangeCode: true
        }
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/course/' + this.state.courseID + '/exercise/' + this.state.exerciseID)
            .then(response => {
				this.setState({
					exerciseID: response.data._id,
					name: response.data.name,
					subExercises: response.data.subExercises
				});
            })
            .catch((error) => {
                console.error("Course or Exercise not found!");
				this.props.history.push('/');
            });
    }

    render () {

		if (this.state.subExercises.length === 0) {
			return null;
		}

        return (
            <div className="disableSelection" style={{marginTop: '60px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
				<div style={{textAlign: "center"}}>
                	<h3>{this.state.name}</h3>
				</div>

                <br />

				<div style={{ width: "100%", textAlign: "center"}}>
						{
							this.state.subExercises.map((value, i) => {
								const arrowWidth = Math.min(((((1/this.state.subExercises.length)*100))-(2.5)), 6)+"%";
								let style = { width:arrowWidth, marginLeft:"5px", };
								return <div
									style={style}
									className="progress-arrow progress-arrow-neutral"
									key={"SelectorSubExercises"+i}
									onClick={() => {
										this.setState({ subExerciseIndex: i });
									}}
									onContextMenu={(e) => this.deleteSubExcerise(e, i)}
								></div>
							})
						}
					</div>

                <br />

                <ExerciseContent
					subExerciseIndex={this.state.subExerciseIndex}
                    content={this.state.subExercises[this.state.subExerciseIndex].content}
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
                    content={this.state.subExercises[this.state.subExerciseIndex].content}
                    didChangeCode={this.state.didChangeCode}
                    onRanCode={this.onRanCode}
					setHighlighting={this.setHighlighting}
					largeMargin={true}
                />
            </div>
        );
    }



    onChangeExerciseAceEditor(e, value, id, key, keySettings) {
        key = key || "code"; // code, solution, identifier, package, name, settings (minLines)

        let index = this.getIndexOfContent(id);

        if (index > 0 && key === "code") {
            this.setState({
				subExercises: update(
					this.state.subExercises,
					{
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
				)
			});
            if (key === "code" || key === "solution") {
                this.setState({didChangeCode: true});
                this.setHighlighting(null);
            }
        }
    }

    getIndexOfContent(id) {
        let index = -1;
        let i = 0;
        for (let currentContent of this.state.subExercises[this.state.subExerciseIndex].content) {
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
        for (let currentSourceFile of this.state.sourceFiles) {
            if (currentSourceFile._id === id) {
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