import React, {Component} from 'react';

import Row from 'react-bootstrap/Row';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ContentEditorEditor extends Component {
    
    render () {
        return (
            <div as={Row} style={{'marginBottom': '30px', 'marginTop': '30px', 'borderColor': '#538135', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
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
                        wrap: true,
                        animatedScroll: true,
                        autoScrollEditorIntoView: true
                    }}
                />
            </div>
        );
    }
}