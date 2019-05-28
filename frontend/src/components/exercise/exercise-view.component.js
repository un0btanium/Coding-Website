import React, {Component} from 'react';
import { Form } from 'react-bootstrap';

import ExerciseEdit from './exercise-edit.component';
import ExerciseSolve from './exercise-solve.component';

import { isAuthenticated } from "../../services/Authentication";


// TODO create modal: do you want to save changes when admin/maintainer is switching between modes

export default class ExerciseView extends Component {
    
    constructor(props) {
        super(props);

        this.onChangeMode = this.onChangeMode.bind(this);

        this.state = {
            mode: this.props.mode || "solve", // solve or edit
        }
    }

    render () {
        let modeToggle = null;
        if (isAuthenticated(["admin", "maintainer"])) {
            modeToggle = <Form.Check id="modeToggleSwitch" type="checkbox" className="custom-switch" custom="true" label="Edit Mode" checked={this.state.mode === "edit"} onChange={this.onChangeMode} />
        }

        if (this.state.mode === "edit") {
            return (
                <>
                    {modeToggle}
                    <ExerciseEdit  exerciseID={this.props.match.params.id} history={this.props.history} />
                </>
            );
        } else {
            return (
                <>
                    {modeToggle}
                    <ExerciseSolve exerciseID={this.props.match.params.id} history={this.props.history} />
                </>
            );
        }
    }

    onChangeMode(e) {
        this.setState({
            mode: e.target.checked ? "edit" : "solve"
        })
        
    }

}