import React, {Component} from 'react';

import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class ExerciseElementSidebar extends Component {

    render () {
        if (this.props.mode === "solve") {
            return null;
        } else if (this.props.mode === "edit") {
            return (
                <div style={{ textAlign: 'right', position: 'relative', left: '-140px', top: '67px',  marginTop: '-55px' }}>
                    <h5>{this.props.text + ""}</h5>
                    <Button size="sm" variant="danger" onClick={ (e) => { this.props.delete(this.props.id); }}>Delete</Button> 
                    <Button size="sm" variant="secondary" onClick={ (e) => { this.props.move(this.props.id, true); }}><FontAwesomeIcon icon={faCaretUp} /></Button> 
                    <Button size="sm" variant="secondary" onClick={ (e) => { this.props.move(this.props.id, false); }}><FontAwesomeIcon icon={faCaretDown} /></Button> 
                </div>
            );
        } else {
            return null;
        }
    }
}