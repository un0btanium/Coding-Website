import React, {Component} from 'react';

import { Row } from 'react-bootstrap';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'


export default class ExerciseCode extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (<>
				<div style={{ position: 'relative', left: '-25px', top: '45px', marginTop: '-40px' }}>
					<FontAwesomeIcon icon={faInfoCircle} style={{ margin: '0px', color:'#4472c4' }} />
                </div>
				<div as={Row} style={{'marginBottom': '15px', 'marginTop': '15px', 'borderColor': '#4472c4', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%', boxShadow: '2px 2px 5px #000000'}}>
				<AceEditor
                        mode="java"
                        theme="monokai"
                        name={this.props.content._id}
                        value={this.props.content.code}
                        width='100%'
                        height='100%'
                        readOnly={true}
                        editorProps={{$blockScrolling: Infinity}}
                        setOptions={{
                            showLineNumbers: true,
                            wrap: true,
                            minLines: (this.props.content.settings ? this.props.content.settings.minLines || 1 : 1) ,
                            maxLines: Infinity,
                            printMarginColumn: 200,
                            fontSize: '18px',
                            fontFamily: 'Consolas, "Courier New", Courier, monospace'
                        }}
                    />
                </div>
			</>
            );
        } else if (this.props.mode === "edit") {
            return (<>
				<div style={{ position: 'relative', left: '-135px', top: '55px', marginTop: '-40px' }}>
					<FontAwesomeIcon icon={faInfoCircle} style={{ margin: '0px', color:'#4472c4' }} />
                </div>
				<div style={{'borderColor': '#4472c4', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%', boxShadow: '2px 2px 5px #000000'}}>
					<AceEditor
						mode="java"
						theme="monokai"
						name={this.props.content._id}
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
							printMarginColumn: 200,
							fontSize: '18px',
							fontFamily: 'Consolas, "Courier New", Courier, monospace'
						}}
					/>
				</div>
            </>);
        }
    }
}