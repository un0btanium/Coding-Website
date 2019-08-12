import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import { Row, Col, Button } from 'react-bootstrap';

export default class ProcessOverview extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			processes: [],
			currentServerDate: new Date()
		};
	}

	componentDidMount() {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/processes')
			.then(response => {
				console.log(response)
				this.setState({
					processes: response.data.processes,
					currentServerDate: new Date(response.data.currentDate)
				});
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	render () {

		const Process = props => (
			<div
				className="disableSelection fadeIn"
				style={{
					order: props.index,
					flexGrow: 4,
					flexShrink: 2,
					justifyContent: "space-evenly",
					margin: "10px",
					padding: "5px",
					backgroundColor: "rgb(0, 0, 0)",
					boxShadow: '2px 2px 5px #000000'
				}}
			>
				<div style={{ padding: "10px", backgroundColor: "rgba(0, 0, 0, 0.5)"}}>
					<Row>
						<Col>
							<h6><b>{props.process.userData.email}</b></h6>
						</Col>
						<Col>
							<h6><b>{props.process.exerciseData.courseName}</b></h6>
						</Col>
						<Col>
							<h6><b>{props.process.exerciseData.exerciseName}</b></h6>
						</Col>
						<Col>
							<h6><b>{props.process.exerciseData.subExerciseIndex}</b></h6>
						</Col>
						<Col>
							<h6><b>{Math.floor((props.currentServerDate - new Date(props.process.started))/60000)}:{Math.floor((props.currentServerDate - new Date(props.process.started))/1000%60)}</b></h6>
						</Col>
						<Col>
							<Button variant="danger" onClick={(e) => props.terminateProcess(e, props.index, props.process.userData.userId)} key="DeleteExerciseButton" style={{ marginLeft: "20px"}}><FontAwesomeIcon icon={faTrashAlt} /></Button>
						</Col>
					</Row>
				</div>
			</div>
		);

		return (
			<div style={{marginTop: '50px'}}>
				
				<div style={{textAlign: "center"}}>
					<h1>Processes</h1>
				</div>
				<div style={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", marginTop: "20px" }}>
					{ 
						this.state.processes.map((process, i) => {
							return <Process process={process} currentServerDate={this.state.currentServerDate} terminateProcess={(e, index, userID) => this.terminateProcess(e, index, userID)} index={i} key={"Process" + i} />;
						})
					}
				</div>
			</div>
		)
	}

	terminateProcess(e, index, userID) {
        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/process/terminate', { userID: userID })
            .then(response => {
				this.setState({
					processes: update(this.state.processes, {
						$splice: [[index, 1]]
					})
				});
			})
            .catch((error) => {
                console.error("Unable to terminate process");
                console.error(error);
            });
	}
}