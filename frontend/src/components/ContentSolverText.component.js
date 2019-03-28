import React, {Component} from 'react';

import Row from 'react-bootstrap/Row';

export default class ContentEditorText extends Component {

    render () {
        return (
            <p as={Row} style={{'marginBottom': '15px'}}>{this.props.content.text}</p>
        );
    }

}