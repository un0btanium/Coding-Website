import React, {Component} from 'react';

import { Form, Container, Row, Col } from 'react-bootstrap';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ExerciseEditor extends Component {
    
    render () {
        
        let highlightOverlay = null;
        if (this.props.result && this.props.result.steps && this.props.result.steps.length > 0 && this.props.step >= 0) {
            // for (let i = 0; i < this.props.console_output.length; i++) {
            //     this.result.console_output[this.props.step]
            // }
            let node = this.props.result.node_data[this.props.result.steps[this.props.step].id];
            let sizeColumn = 9.9; //10.04166666666667;
            let sizeLine = 22;

            let x = 46 + sizeColumn * (node.columnStart-1);
            let y = sizeLine * (node.lineStart-1-11); // -9

            let w = sizeColumn * ((node.columnEnd - node.columnStart) + 1);
            let h = sizeLine * ((node.lineEnd-node.lineStart)+1);

            // console.log(x + " " + y + " " + w + " " + h);

            highlightOverlay = <div style={{position: 'relative', width: '100%', height: '100%'}}><div style={{position: 'absolute', width: w, height: h, left: x, top: y, backgroundColor: 'rgba(255,32,32,0.3)', zIndex: '2', pointerEvents: 'none'}}></div></div>;
        }

        if (this.props.mode === "solve") {
            return (
                <Row style={{'marginLeft': '0px', 'marginBottom': '15px', 'marginTop': '15px', 'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                {highlightOverlay}
                    <AceEditor
                        mode="java"
                        theme="monokai"
                        name={this.props.content._id}
                        value={this.props.content.code}
                        fontSize='18px'
                        width='100%'
                        // cursorStart={1}
                        onChange={(value, e) => { this.props.onChange(e, value, this.props.content._id); }}
                        editorProps={{$blockScrolling: Infinity}}
                        setOptions={{
                            enableBasicAutocompletion: true,
                            // enableLiveAutocompletion: true,
                            enableSnippets: true,
                            showLineNumbers: true,
                            minLines: (this.props.content.settings ? this.props.content.settings.maxLines || 5 : 5),
                            maxLines: Infinity,
                            wrap: false,
                            animatedScroll: true,
                            autoScrollEditorIntoView: true,
                            printMarginColumn: 200
                        }}
                    />
                </Row>
            );
        } else if (this.props.mode === "edit") {
            return (
                <>
                    <Container>
                        <Row>
                            <Col sm={2}  style={{textAlign: 'right'}}>
                                <Form.Label style={{ 'marginTop': '5px'}}><h5>Identifier:</h5></Form.Label>
                            </Col>
                            <Col sm={4}>
                                <Form.Control
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter identifier"
                                    name={this.props.content._id}
                                    value={this.props.content.identifier}
                                    onChange={(e) => { this.props.onChange(e, e.target.value, this.props.content._id, "identifier"); }}
                                />
                            </Col>
                        </Row>
                    </Container>
                    <Row style={{'marginLeft': '0px', 'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                        {highlightOverlay}
                        <AceEditor
                            mode="java"
                            theme="monokai"
                            name={this.props.content._id}
                            fontSize='18px'
                            width='100%'
                            value={this.props.content.code}
                            onChange={(value, e) => { this.props.onChange(e, value, this.props.content._id); }}
                            // cursorStart={1}
                            editorProps={{$blockScrolling: Infinity}}
                            setOptions={{
                                enableBasicAutocompletion: true,
                                // enableLiveAutocompletion: true,
                                enableSnippets: true,
                                showLineNumbers: true,
                                minLines: (this.props.content.settings ? this.props.content.settings.minLines || 5 : 5),
                                maxLines: Infinity,
                                wrap: false,
                                animatedScroll: true,
                                autoScrollEditorIntoView: true,
                                printMarginColumn: 200
                            }}
                        />
                    </Row>
                </>
            );
        }
    }
}