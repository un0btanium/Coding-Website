import React, {Component} from 'react';
import Axios from 'axios';

import ExerciseContent from './content/exercise-content.component';
import ExerciseConsole from './content/exercise-console.component';


export default class ExerciseSolve extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        this.onRanCode = this.onRanCode.bind(this);
        this.setHighlighting = this.setHighlighting.bind(this);

        this.state = {
            exerciseID: '',
            name: '',
            sourceFiles: [],
            content: [],
            highlighting: null,

            didChangeCode: true
        }
    }

    componentDidMount() {
        Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/exercise/' + this.props.exerciseID)
            .then(response => {
                this.setState({
                    exerciseID: response.data._id,
                    name: response.data.name,
                    content: response.data.content,
                    sourceFiles: response.data.source_files
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render () {
        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                <h3>{this.state.name}</h3>

                <br />
                <br />

                <ExerciseContent
                    content={this.state.content}
                    mode="solve"
                    onChangeExerciseContent={this.onChangeExerciseContent}
                    onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                    deleteContent={this.deleteContent}
                    moveContent={this.moveContent}
                    highlighting={this.state.highlighting}
                />

                <br />
                <br />

                <ExerciseConsole
                    exerciseID={this.state.exerciseID}
                    content={this.state.content}
                    didChangeCode={this.state.didChangeCode}
                    onRanCode={this.onRanCode}
                    setHighlighting={this.setHighlighting}
                />
            </div>
        );
    }



    onChangeExerciseAceEditor(e, value, id, key, keySettings) {
        key = key || "code"; // code, solution, identifier, package, name, settings (minLines)

        let index = this.getIndexOfContent(id);

        if (index > 0 && key === "code") {
            const newContent = [...this.state.content]
            newContent[index][key] = value;
            this.setState({content: newContent});
            if (key === "code" || key === "solution") {
                this.setState({didChangeCode: true});
            }
        }


    }

    getIndexOfContent(id) {
        let index = -1;
        let i = 0;
        for (let currentContent of this.state.content) {
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


    setHighlighting(region) {
        this.setState({
            highlighting: region
        });
    }

}