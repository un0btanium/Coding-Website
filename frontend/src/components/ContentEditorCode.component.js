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

export default class ContentEditorCode extends Component {

    render () {
        return (
            <Form.Group as={Row} className="form-group">
                <Form.Label column sm><h5>Code:</h5></Form.Label>
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
                            maxLines: Infinity
                        }}
                    />
                </div>
            </Form.Group>
        );
    }
}