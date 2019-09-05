import React, {Component} from 'react';

import { Form, Row } from 'react-bootstrap';

import 'katex/dist/katex.min.css';
import TeX from '@matejmazur/react-katex';

export default class ExerciseFormula extends Component {

    render () {

        if (this.props.mode === "solve") {
            return (
				<div style={{textAlign: "center"}}>
                    <TeX math={this.props.content.text} style={{'marginBottom': '15px'}}/>
                </div>
            );
        } else if (this.props.mode === "edit") {
            
            return (
                <>
                    <Form.Control
                        style={{color: 'white', marginBottom: '15px', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)', textAlign: "justify"  }}
                        plaintext="true"
                        autoComplete="off"
                        as="textarea"
                        rows="4"
                        placeholder="Enter text"
                        name={this.props.content._id}
                        defaultValue={this.props.content.text}
                        onChange={this.props.onChange}
                    />
                    <div style={{textAlign: "center"}}>
                        <TeX math={this.props.content.text} style={{'marginBottom': '15px'}}/>
                    </div>
                </>
            );
        }
    }

}