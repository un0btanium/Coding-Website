import React, {Component} from 'react';

import { Form, Button, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class ExerciseTitle extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <h4 as={Row} style={{'marginBottom': '20px'}}>{this.props.content.text}</h4>
            );
        } else if (this.props.mode === "edit") {

            let deleteContent = this.props.deleteContent;
            let moveContent = this.props.moveContent;
            
            return (
                <>
                    <Form.Group as={Row} className="form-group">
                        <div style={{ textAlign: 'right', position: 'relative', left: '-140px', top: '67px',  marginTop: '-55px' }}>
                            <h5>Title:</h5>
                            <Button size="sm" variant="danger" onClick={ (e) => { deleteContent(this.props.content._id); }}>Delete</Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, true); }}><FontAwesomeIcon icon={faCaretUp} /></Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, false); }}><FontAwesomeIcon icon={faCaretDown} /></Button> 
                        </div>
                        <Form.Control 
                            type="text"
                            className="form-control"
                            placeholder="Enter title"
                            name={this.props.content._id}
                            defaultValue={this.props.content.text}
                            onChange={this.props.onChange}
                        />
                    </Form.Group>
                </>
            );
        }
    }

}