import React, {Component} from 'react';

import Row from 'react-bootstrap/Row';

export default class ContentEditorTitle extends Component {

    render () {
        return (
            <h4 as={Row} style={{'marginBottom': '20px'}}>{this.props.content.text}</h4>
        );
    }

}