import React, {Component} from 'react';
import Axios from 'axios';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import ContentEditor from '../components/ContentEditor.component';

export default class ExerciseEdit extends Component {
    
    constructor(props) {
        super(props);

        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseContent = this.onChangeExerciseContent.bind(this);
        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);
        
        this.addNewTitle = this.addNewTitle.bind(this);
        this.addNewText = this.addNewText.bind(this);
        this.addNewCode = this.addNewCode.bind(this);
        this.addNewEditor = this.addNewEditor.bind(this);

        this.onSubmit = this.onSubmit.bind(this);

        this.state = {
            id_counter: 0,
            id: '',
            name: '',
            content: [
            ],
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
                <h3>Edit Exercise</h3>

                <br />
                <br />

                <Form onSubmit={this.onSubmit}>
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

                    <ContentEditor content={this.state.content} onChangeExerciseContent={this.onChangeExerciseContent} onChangeExerciseAceEditor={this.onChangeExerciseAceEditor} />
                    
                    <br/>
                    <br/>

                    <Form.Group as={Row} className="form-group">
                        <Col>
                            <Button variant="outline-primary" onClick={this.addNewTitle} style={{width: '150px'}}>+Title</Button>
                            <Button variant="outline-primary" onClick={this.addNewText} style={{width: '150px'}}>+Text</Button>
                            <Button variant="outline-primary" onClick={this.addNewCode} style={{width: '150px'}}>+Code</Button>
                            <Button variant="outline-primary" onClick={this.addNewEditor} style={{width: '150px'}}>+Editor</Button>
                        </Col>
                    </Form.Group>

                    <br/>
                    <br/>

                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{width: '150px', float: 'right'}}>Save</Button>
                    </Form.Group>
                </Form>
            </div>
        )
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

    
}