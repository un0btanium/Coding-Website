import React, {Component} from 'react';

import ExerciseTitle from './exercise-title.component';
import ExerciseText from './exercise-text.component';
import ExerciseCode from './exercise-code.component';
import ExerciseEditor from './exercise-editor.component';
import ExerciseConsole from './exercise-console.component';

export default class ExerciseContent extends Component {
    
    render () {
        
        if (this.props.content.length === 0) {
            return <div></div>;
        }

        const onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;
        const mode = this.props.mode;
        const result = this.props.result;
        const step = this.props.step;

        let res = this.props.content.map(function(currentContent, i) {
            switch(currentContent.type) {
                case "title":
                    return <ExerciseTitle content={currentContent} mode={mode} result={result} step={step} key={currentContent._id} />;
                case "text":
                    return <ExerciseText content={currentContent} mode={mode} result={result} step={step} key={currentContent._id} />;
                case "code":
                    return <ExerciseCode content={currentContent} mode={mode} result={result} step={step} key={currentContent._id} />;
                case "editor":
                    return <ExerciseEditor onChange={onChangeExerciseAceEditor} content={currentContent} mode={mode} result={result} step={step} key={currentContent._id} />;
                
                default:
                    return <h4 key={i}>Unknown content!!!</h4>;
            }
        });

        if (this.props.result && this.props.result.steps) {
            res.push(<ExerciseConsole mode={mode} result={result} step={step} key="console_output"/>);
        }

        return res;
    }
}