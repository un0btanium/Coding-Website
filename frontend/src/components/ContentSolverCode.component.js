import React, {Component} from 'react';

import Row from 'react-bootstrap/Row';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

export default class ContentSolverCode extends Component {

    render () {
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
                        maxLines: Infinity
                    }}
                />
            </div>
        );
    }
}