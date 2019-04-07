import React, {Component} from 'react';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

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
        if (this.props.result && this.props.step >= 0) {
            // for (let i = 0; i < this.props.console_output.length; i++) {
            //     this.result.console_output[this.props.step]
            // }
            let node = this.props.result.node_data[this.props.result.steps[this.props.step].id];
            let sizeColumn = 9.9; //10.04166666666667;
            let sizeLine = 22;

            let x = 46 + sizeColumn * (node.columnStart-1);
            let y = sizeLine * (node.lineStart-1-9); // -9

            let w = sizeColumn * ((node.columnEnd - node.columnStart) + 2);
            let h = sizeLine * ((node.lineEnd-node.lineStart)+1);

            // console.log(x + " " + y + " " + w + " " + h);

            highlightOverlay = <div style={{position: 'relative', width: '100%', height: '100%'}}><div style={{position: 'absolute', width: w, height: h, left: x, top: y, backgroundColor: 'rgba(255,32,32,0.4)', zIndex: '2', pointerEvents: 'none'}}></div></div>;
        }

        if (this.props.mode === "solve") {
            return (
                <div as={Row} style={{'marginBottom': '30px', 'marginTop': '30px', 'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
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
                            autoScrollEditorIntoView: true
                        }}
                    />
                </div>
            );
        } else if (this.props.mode === "edit") {
            return (
                <Form.Group as={Row} className="form-group">
                    <Form.Label column sm><h5>Editor:</h5></Form.Label>
                    <div style={{'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
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
                                autoScrollEditorIntoView: true
                            }}
                        />
                    </div>
                </Form.Group>
            );
        }
    }
}