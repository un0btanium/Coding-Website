import React, {Component} from 'react';

import ContentEditorTitle from '../components/ContentEditorTitle.component';
import ContentEditorText from '../components/ContentEditorText.component';
import ContentEditorCode from '../components/ContentEditorCode.component';
import ContentEditorEditor from '../components/ContentEditorEditor.component';


export default class ContentEditor extends Component {
    
    render () {
        
        if (this.props.content.length === 0) {
            return <div></div>;
        }

        const onChangeExerciseContent = this.props.onChangeExerciseContent;
        const onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;

        return this.props.content.map(function(currentContent, i) {
            switch(currentContent.type) {
                case "title":
                    return <ContentEditorTitle onChange={onChangeExerciseContent} content={currentContent} key={currentContent._id} />;
                case "text":
                    return <ContentEditorText onChange={onChangeExerciseContent} content={currentContent} key={currentContent._id} />;
                case "code":
                    return <ContentEditorCode onChange={onChangeExerciseAceEditor} content={currentContent} key={currentContent._id} />;
                case "editor":
                    return <ContentEditorEditor onChange={onChangeExerciseAceEditor} content={currentContent} key={currentContent._id} />;
                
                default:
                    return <h4 key={i}>Unknown content!!!</h4>;
            }
        });
    }
}