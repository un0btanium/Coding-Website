import React, {Component} from 'react';

import { Form, Row } from 'react-bootstrap';

import ExerciseTitle from './exercise-title.component';
import ExerciseText from './exercise-text.component';
import ExerciseCode from './exercise-code.component';
import ExerciseEditor from './exercise-editor.component';
import ExerciseElementSidebar from './exercise-element-sidebar.component';

export default class ExerciseContent extends Component {
    
    render () {
        
        if (this.props.content.length === 0) {
            return <div></div>;
        }

        const onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;
        const onChangeExerciseContent = this.props.onChangeExerciseContent;
        let deleteContent = this.props.deleteContent;
        let moveContent = this.props.moveContent;
        const mode = this.props.mode;
        const result = this.props.result;
        const step = this.props.step;

        let res = 
            this.props.content.map(function(currentContent, i) {
                let element = "";
                let text = "Unknown";
                switch(currentContent.type) {
                    case "title":
                        text = "Title";
                        element =
                            <ExerciseTitle
                                onChange={onChangeExerciseContent}
                                deleteContent={deleteContent}
                                moveContent={moveContent}
                                content={currentContent}
                                mode={mode}
                                result={result}
                                step={step}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    case "text":
                        text = "Text";
                        element =
                            <ExerciseText 
                                onChange={onChangeExerciseContent}
                                deleteContent={deleteContent}
                                moveContent={moveContent}
                                content={currentContent}
                                mode={mode}
                                result={result}
                                step={step}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    case "code":
                        text = "Code";
                        element =
                            <ExerciseCode
                                onChange={onChangeExerciseAceEditor}
                                deleteContent={deleteContent}
                                moveContent={moveContent}
                                content={currentContent}
                                mode={mode}
                                result={result}
                                step={step}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    case "editor":
                        text = "Editor";
                        element =
                            <ExerciseEditor
                                onChange={onChangeExerciseAceEditor}
                                deleteContent={deleteContent}
                                moveContent={moveContent}
                                content={currentContent}
                                mode={mode}
                                result={result}
                                step={step}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    default:
                        element = <h4 key={"ExerciseContent" + i}>Unknown content!!!</h4>;
                        text = "Unknown";
                        break;
                }
                if (mode === "edit") {
                    return (
                        <Form.Group as={Row} className="form-group" key={"ExerciseContentElement" + currentContent._id}>
                            <ExerciseElementSidebar text={text} id={currentContent._id} mode={mode} delete={deleteContent} move={moveContent} key={"ExerciseSidebar" + currentContent._id}/>
                            {element}
                        </Form.Group>
                    );
                } else if (mode === "solve") {
                    return element;
                } else {
                    return <div>Unknown mode</div>
                }
            })

        return res;
    }
}