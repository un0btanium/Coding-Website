import React, {Component} from 'react';

import { Form, Accordion, Card } from 'react-bootstrap';

import Iframe from 'react-iframe';

export default class ExerciseIFrame extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
				<Accordion style={{'marginBottom': '20px', width: "100%", boxShadow: '2px 2px 5px #000000'}} className="disableSelection" defaultActiveKey="0">
					<Accordion.Toggle as={Card.Header} eventKey="0" style={{textAlign: "center"}}>Show/Hide</Accordion.Toggle>
					<Accordion.Collapse eventKey="0" style={{backgroundColor: "#666666"}}>
						<Iframe url={this.props.content.text}
							width="100%"
							height="530px"
							allowFullScreen="true"
							mozallowfullscreen="true"
							webkitallowfullscreen="true"
							frameBorder="0"
						/>
					</Accordion.Collapse>
				</Accordion>
            );
        } else if (this.props.mode === "edit") {
            
            return (
                <Form.Control 
                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                    type="text"
                    autoComplete="off"
                    className="form-control"
                    placeholder="Enter url of the content displayed in the iframe"
                    name={this.props.content._id}
                    defaultValue={this.props.content.text}
                    onChange={this.props.onChange}
                />
            );
        }
    }

}