import React, {Component} from 'react';

import ContentSolverTitle from './ContentSolverTitle.component';
import ContentSolverText from './ContentSolverText.component';
import ContentSolverCode from './ContentSolverCode.component';
import ContentSolverEditor from './ContentSolverEditor.component';
import ContentSolverConsole from './ContentSolverConsole.component';

export default class ContentSolver extends Component {
    
    render () {
        
        if (this.props.content.length === 0) {
            return <div></div>;
        }

        const onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;

        let res = this.props.content.map(function(currentContent, i) {
            switch(currentContent.type) {
                case "title":
                    return <ContentSolverTitle content={currentContent} key={currentContent._id} />;
                case "text":
                    return <ContentSolverText content={currentContent} key={currentContent._id} />;
                case "code":
                    return <ContentSolverCode content={currentContent} key={currentContent._id} />;
                case "editor":
                    return <ContentSolverEditor onChange={onChangeExerciseAceEditor} content={currentContent} key={currentContent._id} />;
                
                default:
                    return <h4 key={i}>Unknown content!!!</h4>;
            }
        });

        if (this.props.result.console_output) {
            res.push(<ContentSolverConsole console_output={this.props.result.console_output} key="console_output"/>);
        }

        return res;
    }
}