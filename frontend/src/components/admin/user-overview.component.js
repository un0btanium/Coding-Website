import React, {Component} from 'react';
import Axios from 'axios';
import update from 'immutability-helper';

import { Button, Row, Col } from 'react-bootstrap';

import { getUserData } from '../../services/Authentication'

export default class UserOverview extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
			users: [],
			page: 0
		};
	}

	componentDidMount() {
		Axios.get(process.env.REACT_APP_BACKEND_SERVER + '/users/' + this.state.page)
			.then(response => {
				this.setState({
					users: response.data.users,
					page: response.data.page
				});
			})
			.catch(function (error) {
				console.log(error);
			});
	}

	render () {

		const User = props => (
			<div
				className="disableSelection"
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
							<h4><b>{props.user.email}</b></h4>
						</Col>
						<Col>
							<Button style={{width: "125px"}} variant={props.user.role === "admin" ? "success" : "dark"} onClick={(e) => this.setRole(e, props.index, props.user, "admin")}>Admin</Button>
							<Button style={{width: "125px"}} variant={props.user.role === "maintainer" ? "success" : "dark"} onClick={(e) => this.setRole(e, props.index, props.user, "maintainer")}>Maintainer</Button>
							<Button style={{width: "125px"}} variant={props.user.role === "student" ? "success" : "dark"} onClick={(e) => this.setRole(e, props.index, props.user, "student")}>Student</Button>
						</Col>
					</Row>
				</div>
			</div>
		);

		return (
			<div style={{marginTop: '50px'}}>
				
				<div style={{textAlign: "center"}}>
					<h1>Users</h1>
				</div>
				<div style={{ display: "flex", flexDirection: "column", flexWrap: "nowrap", marginTop: "20px" }}>
					{ 
						this.state.users.map(function(user, i) {
							return <User user={user} index={i} key={"User" + i} />;
						})
					}
				</div>
			</div>
		)
	}

	setRole(e, index, user, newRole) {

		let loggedInUser = getUserData();
		if (user.email === loggedInUser.email || user.role === newRole || loggedInUser.role !== "admin") {
			return;
		}
		
        Axios.put(process.env.REACT_APP_BACKEND_SERVER + '/user/role', { id: user._id, role: newRole})
            .then(response => {
				this.setState({
					users: update(this.state.users, {
						[index]: {
							role: {
								$set: response.data.role
							}
						}
					})
				});
			})
            .catch((error) => {
                console.error("Unable to change role of user!");
				this.props.history.push('/');
            });

	}

}