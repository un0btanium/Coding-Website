import React, {Component} from 'react';

import { Form, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ExerciseEditor extends Component {
    
    render () {
        
        // TODO second first overlay box which displays the value of a variable or expression
        // TODO add editor id name of node highlighting!! add check!


        let highlightOverlay = null;
        if (this.props.highlighting && this.props.highlighting.node !== undefined) {
            // for (let i = 0; i < this.props.console_output.length; i++) {
            //     this.result.console_output[this.props.step]
            // }
            let node = this.props.highlighting.node;
            let sizeColumn = 9.9; //10.04166666666667;
            let sizeLine = 22;

            let x = 46 + sizeColumn * (node.columnStart-1) + sizeColumn * (('' + ((this.props.content.code.match(/\r\n|\r|\n/g) || '').length + 1)).length-1);
            let y = sizeLine * (node.lineStart-1-11); // -9

            let w = sizeColumn * ((node.columnEnd - node.columnStart) + 1) + 2;
            let h = sizeLine * ((node.lineEnd-node.lineStart)+1);

            // console.log(x + " " + y + " " + w + " " + h);

            
            // let rgba = 'rgba(20, 171, 255, 0.3)';
            let rgba = 'rgba(255, 255, 32, 0.3)';
            if (this.props.highlighting.step.valueType === "boolean" || this.props.highlighting.step.valueType === "Boolean") {
                if (this.props.highlighting.step.value === "true") {
                    rgba = 'rgba(32, 255, 32, 0.3)';
                } else {
                    rgba = 'rgba(255, 32, 32, 0.3)';
                }
            }

            highlightOverlay =
                <div style={{position: 'relative', width: '100%', height: '100%'}}>
                    <OverlayTrigger
                        key="tooltopHighlighting"
                        placement="top"
                        delay={{'show': 0, 'hide': 128}}
                        overlay={
                            <Tooltip
                                style={{maxWidth: '100%'}}
                                id="tooltip-top"
                            >
                                <div style={{minWidth: '100px', wordWrap: 'break-word', textAlign: 'left', whiteSpace: 'pre'}}>
                                    {this.props.highlighting.step.action ? <><span><h6>{this.props.highlighting.step.action}</h6></span></> : null}
                                    {this.props.highlighting.step.name ? <><span>{'variable name:   '+ this.props.highlighting.step.name}</span><br/></> : null}
                                    {this.props.highlighting.step.valueType ? <><span>{'type:     '+ this.props.highlighting.step.valueType}</span><br/></> : null}
                                    {this.props.highlighting.step.value ? <><span>{'value:   ' + this.props.highlighting.step.value}</span><br/></> : null}
                                    {this.props.highlighting.step.isPostfix ? <><span>{'isPostfix:   ' + this.props.highlighting.step.isPostfix}</span><br/></> : null}
                                    {this.props.highlighting.step.valueBefore ? <><span>{'value (before):   ' + this.props.highlighting.step.valueBefore}</span><br/></> : null}
                                    {this.props.highlighting.step.valueAfter ? <><span>{'value (after):   ' + this.props.highlighting.step.valueAfter}</span><br/></> : null}
                                    
                                </div>
                            </Tooltip>
                        }
                    >
                        <div style={{position: 'absolute', width: w, height: h, left: x, top: y, backgroundColor: rgba, zIndex: '2', /* pointerEvents: 'none'*/}}></div>
                    </OverlayTrigger>
                </div>;
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
                        onFocus={() => { this.props.setHighlighting(null) }}
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
                                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                    plaintext="true"
                                    autoComplete="off"
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