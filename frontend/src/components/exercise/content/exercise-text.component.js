import React, {Component} from 'react';

import { Form, Button, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown } from '@fortawesome/free-solid-svg-icons';

export default class ExerciseText extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
                <p as={Row} style={{'marginBottom': '15px'}}>{this.props.content.text}</p>
            );
        } else if (this.props.mode === "edit") {

            let deleteContent = this.props.deleteContent;
            let moveContent = this.props.moveContent;
            
            return (
                <>
                    <Form.Group as={Row} className="form-group">
                        <div style={{ textAlign: 'right', position: 'relative', left: '-140px', top: '67px',  marginTop: '-55px' }}>
                            <h5>Text:</h5>
                            <Button size="sm" variant="danger" onClick={ (e) => { deleteContent(this.props.content._id); }}>Delete</Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, true); }}><FontAwesomeIcon icon={faCaretUp} /></Button> 
                            <Button size="sm" variant="info" onClick={ (e) => { moveContent(this.props.content._id, false); }}><FontAwesomeIcon icon={faCaretDown} /></Button> 
                        </div>
                        <Form.Control 
                            as="textarea"
                            rows="10"
                            placeholder="Enter text"
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