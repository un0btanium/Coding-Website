import React, {Component} from 'react';

import { Form, Accordion, Card } from 'react-bootstrap';

export default class ExerciseSpoiler extends Component {

    render () {
        if (this.props.mode === "solve") {
            return (
				<Accordion style={{'marginBottom': '20px', width: "100%", boxShadow: '2px 2px 5px #000000'}} className="disableSelection">
					<Card>
						<Accordion.Toggle as={Card.Header} eventKey="0">{this.props.content.title}</Accordion.Toggle>
						<Accordion.Collapse eventKey="0">
							<Card.Body style={{textAlign: "justify", whiteSpace: "pre-wrap"}}>{this.props.content.text}</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
            );
        } else if (this.props.mode === "edit") {
            
            return (
				<>
					<Form.Control 
						style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
						type="title"
						autoComplete="off"
						className="form-control"
						placeholder="Enter spoiler title"
						name={this.props.content._id}
						defaultValue={this.props.content.title}
						onChange={(e) => this.props.onChange(e, "title")}
						key={"ContentEntryTitle"+this.props.content._id}
					/>
					
					<Form.Control
						style={{color: 'white', marginTop: "20px", border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)', textAlign: "justify" }}
						plaintext="true"
						autoComplete="off"
						as="textarea"
						rows="5"
						placeholder="Enter spoiler text"
						name={this.props.content._id}
						defaultValue={this.props.content.text}
						onChange={this.props.onChange}
						key={"ContentEntryText"+this.props.content._id}
					/>
				</>
            );
        }
    }

}