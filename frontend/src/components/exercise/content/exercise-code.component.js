import React, {Component} from 'react';

import { Form, Button, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ExerciseCode extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <div as={Row} style={{'marginBottom': '15px', 'marginTop': '15px', 'borderColor': '#4472c4', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                    <AceEditor
                        mode="java"
                        theme="monokai"
                        name={this.props.content._id}
                        value={this.props.content.code}
                        fontSize='18px'
                        width='100%'
                        height='100%'
                        readOnly={true}
                        editorProps={{$blockScrolling: Infinity}}
                        setOptions={{
                            showLineNumbers: true,
                            wrap: true,
                            minLines: (this.props.content.settings ? this.props.content.settings.minLines || 1 : 1) ,
                            maxLines: Infinity,
                            printMarginColumn: 200
                        }}
                    />
                </div>
            );
        } else if (this.props.mode === "edit") {

            let deleteContent = this.props.deleteContent;
            let moveContent = this.props.moveContent;
            
            return (
                <>
                    <Form.Group as={Row} className="form-group">
                        <div style={{ textAlign: 'right', position: 'relative', left: '-140px', top: '67px',  marginTop: '-55px' }}>
                            <h5>Code:</h5>
                            <Button size="sm" variant="danger" onClick={ (e) => { deleteContent(this.props.content._id); }}>Delete</Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, true); }}><FontAwesomeIcon icon={faCaretUp} /></Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, false); }}><FontAwesomeIcon icon={faCaretDown} /></Button> 
                        </div>
                        <div style={{'borderColor': '#4472c4', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                            <AceEditor
                                mode="java"
                                theme="monokai"
                                name={this.props.content._id}
                                fontSize='18px'
                                width='100%'
                                value={this.props.content.code}
                                readOnly={false} // because edit mode
                                onChange={(value, e) => { this.props.onChange(e, value, this.props.content._id); }} // TODO maybe do it different event handling?
                                editorProps={{$blockScrolling: Infinity}}
                                setOptions={{
                                    showLineNumbers: true,
                                    wrap: true,
                                    minLines: 1,
                                    maxLines: Infinity,
                                    printMarginColumn: 200
                                }}
                            />
                        </div>
                    </Form.Group>
                </>
            );
        }
    }
}