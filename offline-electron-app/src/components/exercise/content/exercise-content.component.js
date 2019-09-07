import React, {Component} from 'react';

import { Form, Row } from 'react-bootstrap';

import ExerciseTitle from './exercise-title.component';
import ExerciseText from './exercise-text.component';
import ExerciseFormula from './exercise-formula.component';
import ExerciseCode from './exercise-code.component';
import ExerciseEditor from './exercise-editor.component';
import ExerciseSpoiler from './exercise-spoiler.component';
import ExerciseIFrame from './exercise-iframe.component';
import ExerciseElementSidebar from './exercise-element-sidebar.component';

export default class ExerciseContent extends Component {
    
    render () {
        
        if (this.props.content.length === 0) {
            return <div></div>;
        }

		const subExerciseIndex = this.props.subExerciseIndex;
        const onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;
        const onChangeExerciseContent = this.props.onChangeExerciseContent;
        const deleteContent = this.props.deleteContent;
        const moveContent = this.props.moveContent;
		const mode = this.props.mode;
		const isEditorInLightTheme = this.props.isEditorInLightTheme || false;
        const highlighting = this.props.highlighting;
        const setHighlighting = this.props.setHighlighting;
        const showSolutionToggle = this.props.isSubExerciseSolved;

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
                                content={currentContent}
                                mode={mode}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    case "text":
                        text = "Text";
                        element =
                            <ExerciseText 
                                onChange={onChangeExerciseContent}
                                content={currentContent}
                                mode={mode}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
                    case "formula":
                        text = "Formula";
                        element =
                            <ExerciseFormula
                                onChange={onChangeExerciseContent}
                                content={currentContent}
                                mode={mode}
                                key={"ExerciseContent" + currentContent._id}
                            />;
                        break;
					case "spoiler":
						text = "Spoiler";
						element =
							<ExerciseSpoiler
								onChange={onChangeExerciseContent}
								content={currentContent}
								mode={mode}
								key={"ExerciseContent" + currentContent._id}
							/>;
						break;
					case "iframe":
						text = "IFrame";
						element =
							<ExerciseIFrame
								onChange={onChangeExerciseContent}
								content={currentContent}
								mode={mode}
								key={"ExerciseContent" + currentContent._id}
							/>;
						break;
                    case "code":
                        text = "Code";
                        element =
                            <ExerciseCode
                                onChange={onChangeExerciseAceEditor}
                                content={currentContent}
                                mode={mode}
								key={"ExerciseContent" + currentContent._id}
								isEditorInLightTheme={isEditorInLightTheme}
                            />;
                        break;
                    case "editor":
                        text = "Editor";
                        element =
                            <ExerciseEditor
								subExerciseIndex={subExerciseIndex}
                                onChange={onChangeExerciseAceEditor}
								content={currentContent}
								showSolutionToggle={showSolutionToggle}
                                setHighlighting={setHighlighting}
                                highlighting={highlighting}
                                mode={mode}
								isEditorInLightTheme={isEditorInLightTheme}
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
						<div key={"ExerciseContentElementDiv" + currentContent._id}>
						<Form.Group style={{margin: "20px 0px 20px 0px"}} as={Row} className="form-group" key={"ExerciseContentElement" + currentContent._id}>
							<ExerciseElementSidebar text={text} id={currentContent._id} mode={mode} delete={deleteContent} move={moveContent} key={"ExerciseSidebar" + currentContent._id}/>
							{element}
						</Form.Group>
						<hr key={"ExerciseContentDivider" + currentContent._id} style={{backgroundColor: "rgb(128, 128, 128)", marginTop: "30px", marginBottom: "30px"}}/>
						</div>);
                } else if (mode === "solve") {
                    return element;
                } else {
                    return <div>Unknown mode</div>
                }
            })

        return res;
    }
}