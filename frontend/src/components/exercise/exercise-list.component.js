import React, {Component} from 'react';
import Axios from 'axios';

import { isAuthenticated } from "../../services/Authentication";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Alert from 'react-bootstrap/Alert'

export default class ExerciseList extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            exercises: [],
            alerts: [],
            showDeleteModal: false,
            markedExercise: {},
            page: 0
        };
    }

    componentDidMount() {
        Axios.get('http://localhost:4000/exercises/'+this.state.page)
            .then(response => {
                this.setState({
                    exercises: response.data.exercises,
                    page: response.data.page
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    render () {

        return (
            <div style={{marginTop: '50px'}}>
                
                <h3>Exercises</h3>
                <table className="table table-striped" style={{ marginTop: 20 }}>
                    <thead>
                        <tr>
                            <th style={{'width':'250px'}}>Actions</th>
                            <th>Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        { this.exerciseList() }
                    </tbody>
                </table>
                <Modal centered show={this.state.showDeleteModal} onHide={() => this.closeDeleteModal()}>
                    <Modal.Header closeButton>
                        <Modal.Title>Delete Exercise {this.state.markedExercise.name}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>Are you sure you want to delete the exercise?</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => this.closeDeleteModal()}>
                        Cancel
                        </Button>
                        <Button variant="danger" onClick={() => this.delete(this.state.markedExercise._id)}>
                        Delete
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        )
    }



    alertList() {
        const TimedDeleteAlert = props => (
            <Alert centered show={this.state.showDeleteAlert} variant="success" style={{height: '50px', textAlign: 'center'}}>
                <p>currentAlert</p>
            </Alert>
        );
        return this.state.alerts.map(function(currentAlert, i) {
            return <TimedDeleteAlert alert={currentAlert} key={i} />;
        });
    }

    exerciseList() {
        // TODO Excerise not as table but list with custom areas
        const Exercise = props => (
            <tr>
                <td>
                    { isAuthenticated(["admin", "maintainer"]) && [
                        <Button variant="danger" onClick={() => this.showDeleteModal(props.exercise)}>Delete</Button>,
                        <span> </span>,
                        <Button variant="primary" onClick={() => this.edit(props.exercise._id)}>Edit</Button>,
                        <span> </span>
                        ]
                    }
                    <Button variant="info" onClick={() => this.solve(props.exercise._id)}>Solve</Button>
                </td>
                <td>
                    <h5 style={{'height': '20px', 'lineHeight': '37px'}}>{props.exercise.name}</h5>
                    <div className="progress-arrows-wrap">
                        {
                            [...Array(props.pages).keys()].map(function(value, i) {
                                const arrowWidth = Math.min(((((1/props.pages)*100))-(0.5)), 6)+"%";
                                let style = { width:arrowWidth, marginLeft:"5px", };
                                return <div style={style} className="progress-arrow" key={i}></div>
                            })
                        }
                    </div>
                </td>
                
            </tr>
        );
        return this.state.exercises.map(function(currentExercise, i) {
            const arrowAmount = 4;
            return <Exercise exercise={currentExercise} pages={arrowAmount} key={i} />;
        });
    }



    showDeleteModal(exercise) {
        this.setState({
            markedExercise: exercise,
            showDeleteModal: true
        });
    }

    closeDeleteModal() {
        this.setState({
            showDeleteModal: false,
            markedExercise: {}
        });
    }



    edit(id) {
        this.props.history.push('/exercise/edit/'+id);
    }

    solve(id) {
        this.props.history.push('/exercise/solve/'+id);
    }

    delete(id) {
        Axios.delete('http://localhost:4000/exercise/'+id)
            .then(response => {

                let index = -1
                // let name = "";

                let counter = 0;
                for (let exercise of this.state.exercises) {
                    if (exercise._id === id) {
                        index = counter;
                        // name = exercise.name;
                        break
                    }
                    counter++;
                } 

                if (index !== -1) {
                    this.state.exercises.splice(index, 1);
                    this.setState({
                        exercises: this.state.exercises,
                        showDeleteModal: false,
                        markedExercise: {}
                        // , alerts: this.state.alerts.push("Exercise '" + name + "'deleted!")
                    });
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }
}