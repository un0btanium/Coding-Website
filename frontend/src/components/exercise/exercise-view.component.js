import React, {Component} from 'react';
import Axios from 'axios';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ExerciseContent from './content/exercise-content.component';

let timeout = null;
export default class ExerciseView extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        // both
        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);
        this.simulateNextStep = this.simulateNextStep.bind(this);
        

        // edit only
        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseContent = this.onChangeExerciseContent.bind(this);

        this.addNewTitle = this.addNewTitle.bind(this);
        this.addNewText = this.addNewText.bind(this);
        this.addNewCode = this.addNewCode.bind(this);
        this.addNewEditor = this.addNewEditor.bind(this);

        this.onSubmit = this.onSubmit.bind(this);


        // solve only
        this.runCode = this.runCode.bind(this);


        this.state = {
            mode: this.props.mode || "solve", // solve or edit

            // both
            id: '',
            name: '',
            content: [
            ],

            // edit only
            id_counter: 0,

            // solve only
            result: null,
            step: 0
        }
    }

    componentDidMount() {
        Axios.get('http://localhost:4000/exercise/'+this.props.match.params.id)
            .then(response => {
                this.setState({
                    id: response.data._id,
                    name: response.data.name,
                    content: response.data.content
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    componentWillUnmount() {
        clearTimeout(timeout);
    }

    render () {

        let exerciseView;
        if (this.state.mode === "edit") {
            exerciseView = this.getExerciseEditView();
        } else {
            exerciseView = this.getExerciseSolveView();
        }

        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                { this.state.mode === "edit" && <h3>Edit Exercise</h3> }
                { this.state.mode === "solve" && <h3>{this.state.name}</h3> }

                <br />
                <br />

                {exerciseView}
                
            </div>
        )
    }

    getExerciseEditView() {
        return <Form onSubmit={this.onSubmit}>
                    <Form.Group as={Row} className="form-group">
                        <Form.Label column sm><h5>Name:</h5></Form.Label>
                        <Col sm={10}>
                            <Form.Control 
                                autoFocus
                                type="text"
                                className="form-control"
                                placeholder="Enter name"
                                value={this.state.name}
                                onChange={this.onChangeExerciseName}
                            />
                        </Col>
                    </Form.Group>

                    <br />
                    <br />

                    <ExerciseContent content={this.state.content} mode={this.state.mode} result={this.state.result} step={this.state.step} onChangeExerciseContent={this.onChangeExerciseContent} onChangeExerciseAceEditor={this.onChangeExerciseAceEditor} />
                    
                    <br />
                    <br />

                    <Form.Group as={Row} className="form-group">
                        <Col>
                            <Button variant="outline-primary" onClick={this.addNewTitle} style={{width: '150px'}}>+Title</Button>
                            <Button variant="outline-primary" onClick={this.addNewText} style={{width: '150px'}}>+Text</Button>
                            <Button variant="outline-primary" onClick={this.addNewCode} style={{width: '150px'}}>+Code</Button>
                            <Button variant="outline-primary" onClick={this.addNewEditor} style={{width: '150px'}}>+Editor</Button>
                        </Col>
                    </Form.Group>

                    <br />
                    <br />

                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Save</Button>
                    </Form.Group>
                </Form>;
    }

    getExerciseSolveView() {
        return <><ExerciseContent content={this.state.content} mode={this.state.mode} result={this.state.result} step={this.state.step} onChangeExerciseContent={this.onChangeExerciseContent} onChangeExerciseAceEditor={this.onChangeExerciseAceEditor} />

                <br />
                <br />

                <Button variant="success" onClick={this.runCode} style={{width: '150px', float: 'right'}}>Run Code</Button></>;
    }


    addNewTitle() {
        this.setState({
            id_counter: this.state.id_counter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.id_counter,
                        type: "title",
                        text: ""
                    }
                ]
            )
        });
    }

    addNewText() {
        this.setState({
            id_counter: this.state.id_counter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.id_counter,
                        type: "text",
                        text: ""
                    }
                ]
            )
        });
    }

    addNewCode() {
        this.setState({
            id_counter: this.state.id_counter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.id_counter,
                        type: "code",
                        code: "",
                        settings: {
                            minLines: 1
                        }
                    }
                ]
            )
        });
    }

    addNewEditor() {
        this.setState({
            id_counter: this.state.id_counter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.id_counter,
                        type: "editor",
                        code: "",
                        solution: "",
                        settings: {
                            minLines: 5
                        }
                    }
                ]
            )
        });
    }

    removeContent() {
        let id = 0;
        this.setState({
            content: this.state.content.filter((c, _id) => _id !== id)
        });
    }

    
    onChangeExerciseName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeExerciseContent(e) {

        let index = -1;
        let i = 0;
        for (let currentContent of this.state.content) {
            if (currentContent._id === e.target.name) {
                index = i;
                break;
            }
            i++;
        }

        if (index === -1) {
            console.error("No exercise content found!");
            return;
        }

        const newContent = [...this.state.content]
        newContent[index].text = e.target.value;
        this.setState({content: newContent});
    }

    onChangeExerciseAceEditor(e, value, id) {

        let index = -1;
        let i = 0;
        for (let currentContent of this.state.content) {
            if (currentContent._id === id) {
                index = i;
                break;
            }
            i++;
        }

        if (index === -1) {
            console.error("No exercise content found!");
            return;
        }

        const newContent = [...this.state.content]
        newContent[index].code = value;
        this.setState({content: newContent});
    }



    onSubmit(e) {
        e.preventDefault();

        if (this.state.name === '') {
            return;
        }

        
        // remove id from new content entries so that the database gives it an accual id
        const content = this.state.content.map(function(currentContent) {
            if (currentContent._id.startsWith("NEW ")) {
                delete currentContent["_id"];
                return currentContent;
            } else {
                return currentContent;
            }
        });
        
        const exercise = {
            id: this.state.id,
            name: this.state.name,
            content: content
        }
        console.log(exercise);

        Axios.put('http://localhost:4000/exercise', exercise)
        .then(res => {
            console.log(res.data);
            this.props.history.push('/exercises');
        });
    }

    runCode(e) {
        let code_snippets = {};
        for (let currentContent of this.state.content) {
            if (currentContent.type === "editor") {
                code_snippets[currentContent.identifier] = {
                    code: currentContent.code
                }
            }
        }

        let data = {
            id: this.state.id,
            code_snippets: code_snippets
        }

        console.log(data);
        
        let options = {
            timeout: 60*1000,
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json",
                'keepAlive':true,
                // 'Content-Length': 0,
                // 'Connection': 'keep-alive',
                // 'Transfer-Encoding': 'chunked',
                'maxSockets':1
            }
        };
        // let outputArray = [];
        Axios.post('http://localhost:4000/exercise/run', data, options)
            .then(response => {
                if (response.status === 200) {

                    console.log("response type");
                    console.log(typeof response.data);
                    console.log(response);

                    this.saveCodeResponse(response.data);
                    
                    // if (typeof response.data === "string") {
                    //     this.saveCodeResponse(response.data);
                    // } else if (typeof response.data === "object") {
                    //     let output = Buffer.from(response.data).toString();
                    //     this.saveCodeResponse(output);
                    // } 
                }
            })
            .catch(function (error) {
                console.error(error);
            });

            
        // let httpData = {

        // }
        // let optionsHttp = {
        //     method: 'POST',
        //     host: 'localhost',
        //     port: '4000',
        //     path: '/exercise/run',
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     timeout: 10000,
        //     responseType: 'stream', 
        //     headers: {
        //         // 'Content-Length': 100000,
        //         // 'Connection': 'keep-alive',
        //         // 'Transfer-Encoding': 'chunked',
        //         'keepAlive':true,
        //         // 'maxSockets':1
        //     }
        // };
        // Http.request(optionsHttp);
    }

    saveCodeResponse(json) {

        if (timeout !== null) {
            clearTimeout(timeout);
        }

        this.setState({
            result: json,
            step: 0
        });
        
        timeout = setTimeout(this.simulateNextStep, 64);
    }

    simulateNextStep() {
        // console.log("step: " + this.state.step);
        // SAVE ENTIRE STATE DATA PER STEP (JSON LARGER BUT LESS SIMULATION ON THIS END REQUIRED, EASIER BACK AND FORTH)
        // OR SAVE CHANGES MADE ON EACH STEP (JSON SMALLER BUT HAVE TO SIMULATE ON THIS END. HAVE TO REDO OR SAVE PREVIOUS SIMULATED STATES, COULD ADD FILTER OR BREAKPOINTS)
        if (this.state.result && this.state.result.console_output && this.state.result.console_output.length > 0 && (this.state.step+1) < this.state.result.console_output.length) {
            this.setState({
                step: this.state.step+1
            });
            timeout = setTimeout(this.simulateNextStep, 64);
        } else {
            clearTimeout(timeout);
        }

    }
    
}