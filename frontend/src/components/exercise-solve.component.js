import React, {Component} from 'react';
import Axios from 'axios';

import Button from 'react-bootstrap/Button';

import ContentSolver from '../components/ContentSolver.component';

export default class ExerciseSolve extends Component {
    
    constructor(props) {
        super(props);

        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);
        this.runCode = this.runCode.bind(this);

        this.state = {
            id: '',
            name: '',
            content: [
            ],

            result: {}
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

    render () {
        return (
            <div style={{marginTop: '50px', width: '80%', display: 'block', 'marginLeft': 'auto', 'marginRight': 'auto'}}>
                <h3>{this.state.name}</h3>

                <br />
                <br />

                <ContentSolver content={this.state.content} result={this.state.result} onChangeExerciseAceEditor={this.onChangeExerciseAceEditor} />

                <br/>
                <br/>

                <Button variant="success" onClick={this.runCode} style={{width: '150px', float: 'right'}}>Run Code</Button>
            </div>
        )
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

        Axios.post('http://localhost:4000/exercise/run', data)
            .then(response => {
                console.log(response);
                console.log(JSON.parse(response.data));
                let json = JSON.parse(response.data);
                this.setState({
                    result: json
                });
            })
            .catch(function (error) {
                console.log(error);
            });
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

}