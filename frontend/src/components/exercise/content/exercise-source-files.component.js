import React, {Component} from 'react';

import { Form, Container, Row, Col } from 'react-bootstrap';

import ExerciseElementSidebar from './exercise-element-sidebar.component';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/theme/github';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ExerciseSourceFiles extends Component {
    
    render () {

        let mode = this.props.mode;

        let onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;
        let deleteSourceFile = this.props.deleteSourceFile;
		let moveSourceFile = this.props.moveSourceFile;
		let isEditorInLightTheme = this.props.isEditorInLightTheme;

        let res = 
            this.props.sourceFiles.map(function(sourceFile, i) {
                return (
                <Form.Group style={{ margin: "20px 0px 20px 0px" }} as={Row} className="form-group" key={"SourceFile" + sourceFile._id}>
                    <ExerciseElementSidebar text="Source File" id={sourceFile._id} mode={mode} delete={deleteSourceFile} move={moveSourceFile} key={"ExerciseSidebar" + sourceFile._id}/>
                    <Container style={{ margin: "0px" }} className="disableSelection">
                        
                        <Row>
                            <Col sm={2} style={{textAlign: 'right'}}>
                                <Form.Label style={{ marginTop: '5px'}}><h5>Package:</h5></Form.Label>
                            </Col>
                            <Col sm={4}>
                                <Form.Control
                                    plaintext="true"
                                    type="text"
                                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                    autoComplete="off"
                                    className="form-control"
                                    placeholder="Enter package"
                                    name={"package" + sourceFile._id}
                                    value={sourceFile.package}
                                    onChange={ (e) => { onChangeExerciseAceEditor(e, e.target.value, sourceFile._id, "package"); }} 
                                />
                            </Col>
                        </Row>

                        <Row>
                            <Col sm={2} style={{textAlign: 'right'}}>
                                <Form.Label style={{ 'marginTop': '5px'}}><h5>Class Name:</h5></Form.Label>
                            </Col>
                            <Col sm={4}>
                                <Form.Control 
                                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                    plaintext="true"
                                    autoComplete="off"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter class name"
                                    name={"name" + sourceFile._id}
                                    value={sourceFile.name}
                                    onChange={ (e) => { onChangeExerciseAceEditor(e, e.target.value, sourceFile._id, "name"); }}
                                />
                        	</Col>
						</Row>
						<Row style={{'borderColor': '#c20a00', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', boxShadow: '2px 2px 5px #000000'}}>
							<AceEditor
								mode="java"
								theme={isEditorInLightTheme ? "github" : "monokai"}
								name={"code" + sourceFile._id}
								fontSize='18px'
								width='100%'
								value={sourceFile.code}
								onChange={(value, e) => { onChangeExerciseAceEditor(e, value, sourceFile._id, "code"); }}
								// cursorStart={1}
								editorProps={{$blockScrolling: Infinity}}
								setOptions={{
									enableBasicAutocompletion: true,
									// enableLiveAutocompletion: true,
									enableSnippets: true,
									showLineNumbers: true,
									minLines: 5,
									maxLines: Infinity,
									wrap: false,
									animatedScroll: true,
									autoScrollEditorIntoView: true,
									printMarginColumn: 200
								}}
							/>
						</Row>
                    </Container>
                    
                </Form.Group>
                )
            })
        ;

        return res;
    }
}