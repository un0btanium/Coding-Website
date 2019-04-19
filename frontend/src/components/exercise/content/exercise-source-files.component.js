import React, {Component} from 'react';

import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ExerciseSourceFiles extends Component {
    
    render () {

        let onChangeExerciseAceEditor = this.props.onChangeExerciseAceEditor;
        let deleteSourceFile = this.props.deleteSourceFile;
        let moveSourceFile = this.props.moveSourceFile;

        let res = 
            this.props.sourceFiles.map(function(sourceFile, i) {
                return (
                <>  
                    <Form.Group as={Row} className="form-group" key={sourceFile._id}>
                        <div style={{ textAlign: 'right', position: 'relative', left: '-170px', top: '75px',  marginTop: '-60px' }}>
                            <h5>Source File:</h5>
                            <Button variant="danger" onClick={ (e) => { deleteSourceFile(sourceFile._id); }}>Delete</Button> 
                            <Button variant="info" onClick={ (e) => { moveSourceFile(sourceFile._id, true); }}><FontAwesomeIcon icon={faCaretUp} /></Button> 
                            <Button variant="info" onClick={ (e) => { moveSourceFile(sourceFile._id, false); }}><FontAwesomeIcon icon={faCaretDown} /></Button> 
                        </div>
                        <Container>
                            
                            <Row>
                                <Col sm={2} style={{textAlign: 'right'}}>
                                    <Form.Label style={{ 'marginTop': '5px'}}><h5>Package:</h5></Form.Label>
                                </Col>
                                <Col sm={4}>
                                    <Form.Control
                                        type="text"
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
                                        type="text"
                                        className="form-control"
                                        placeholder="Enter class name"
                                        name={"name" + sourceFile._id}
                                        value={sourceFile.name}
                                        onChange={ (e) => { onChangeExerciseAceEditor(e, e.target.value, sourceFile._id, "name"); }}
                                    />
                            </Col>
                        </Row>
                        </Container>
                        
                        <Row style={{'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                            <AceEditor
                                mode="java"
                                theme="monokai"
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
                    </Form.Group>
                </>
                )
            })
        ;

        return res;
    }
}