import React, {Component} from 'react';
import Axios from 'axios';

import { Form, Button, Row, Col, Tabs, Tab } from 'react-bootstrap';

import ExerciseContent from './content/exercise-content.component';
import ExerciseSourceFiles from './content/exercise-source-files.component';
import ExerciseConsole from './content/exercise-console.component';


let timeout = null;
export default class ExerciseView extends Component {
    
    constructor(props) {
        super(props);
        
        Axios.defaults.adapter = require('axios/lib/adapters/http');

        // both
        this.onChangeExerciseAceEditor = this.onChangeExerciseAceEditor.bind(this);

        // edit only
        this.onChangeExerciseName = this.onChangeExerciseName.bind(this);
        this.onChangeExerciseContent = this.onChangeExerciseContent.bind(this);

        this.addNewTitle = this.addNewTitle.bind(this);
        this.addNewText = this.addNewText.bind(this);
        this.addNewCode = this.addNewCode.bind(this);
        this.addNewEditor = this.addNewEditor.bind(this);
        this.deleteContent = this.deleteContent.bind(this);
        this.moveContent = this.moveContent.bind(this);

        this.addNewSourceFile = this.addNewSourceFile.bind(this);
        this.deleteSourceFile = this.deleteSourceFile.bind(this);
        this.moveSourceFile = this.moveSourceFile.bind(this);

        this.onSubmit = this.onSubmit.bind(this);
        this.exportExerciseAsJSON = this.exportExerciseAsJSON.bind(this);


        // solve only
        this.runCode = this.runCode.bind(this);
        this.onSimulationSpeedChange = this.onSimulationSpeedChange.bind(this);
        this.simulateNextStep = this.simulateNextStep.bind(this);
        this.onNextStepClick = this.onNextStepClick.bind(this);
        this.onPreviousStepClick = this.onPreviousStepClick.bind(this);
        this.onConsoleInput  = this.onConsoleInput.bind(this);


        this.state = {
            mode: this.props.mode || "solve", // solve or edit

            // both
            id: '',
            name: '',
            sourceFiles: [],
            content: [],

            // edit only
            contentIDCounter: 0,
            tabKey: "content",
            exportExerciseField: null,

            // solve only
            didChangeCode: true,
            result: null,
            step: 0,
            delay: 128
        }
    }

    componentDidMount() {
        Axios.get('http://localhost:4000/exercise/'+this.props.match.params.id)
            .then(response => {
                this.setState({
                    id: response.data._id,
                    name: response.data.name,
                    content: response.data.content,
                    sourceFiles: response.data.source_files
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
                { this.state.mode === "edit" && <h3>Edit Exercise {this.state.name}</h3> }
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
                        <Form.Label column sm={2} style={{textAlign: 'right'}}><h5>Name:</h5></Form.Label>
                        <Col sm={8}>
                            <Form.Control 
                                autoFocus
                                style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                plaintext="true"
                                autoComplete="off"
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

                    <Tabs
                        id="controlled-tab-exercise"
                        activeKey={this.state.tabKey}
                        onSelect={(tabKey) => this.setState({ tabKey })}
                    >

                        <Tab variant="primary" eventKey="content" title="Content Elements">
                            <ExerciseContent
                                content={this.state.content}
                                mode={this.state.mode}
                                result={this.state.result}
                                step={this.state.step}
                                onChangeExerciseContent={this.onChangeExerciseContent}
                                onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                                deleteContent={this.deleteContent}
                                moveContent={this.moveContent}
                                onConsoleInput={this.onConsoleInput}
                            />
                            
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
                        </Tab>

                        <Tab variant="primary" eventKey="source-file" title="Source Files">
                            <ExerciseSourceFiles
                                mode={this.state.mode}
                                sourceFiles={this.state.sourceFiles}
                                onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                                deleteSourceFile={this.deleteSourceFile}
                                moveSourceFile={this.moveSourceFile}
                            />
                            
                            <br />
                            <br />

                            <Form.Group as={Row} className="form-group">
                                <Col>
                                    <Button variant="outline-primary" onClick={this.addNewSourceFile} style={{width: '150px'}}>+Source File</Button>
                                </Col>
                            </Form.Group>
                        </Tab>

                    </Tabs>

                    <br />
                    <br />

                    {this.state.exportExerciseField &&
                       <Form.Control
                            style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                            plaintext="true"
                            autoComplete="off"
                            as="textarea"
                            rows="10"
                            name="ExportExerciseField"
                            defaultValue={this.state.exportExerciseField}
                        />
                    }

                    <Form.Group className="form-group">
                        <Button type="submit" variant="success" style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}>Save</Button>
                        <Button variant="danger" onClick={this.exportExerciseAsJSON} style={{marginBottom: '150px', marginTop: '30px', width: '150px', float: 'right'}}>Export</Button>
                    </Form.Group>

                </Form>;
    }

    getExerciseSolveView() {
        return (
            <>
                <ExerciseContent
                    content={this.state.content}
                    mode={this.state.mode}
                    result={this.state.result}
                    step={this.state.step}
                    onChangeExerciseContent={this.onChangeExerciseContent}
                    onChangeExerciseAceEditor={this.onChangeExerciseAceEditor}
                    deleteContent={this.deleteContent}
                    moveContent={this.moveContent}
                    onConsoleInput={this.onConsoleInput}
                />

                <br />
                <br />

                <ExerciseConsole
                    mode={this.state.mode}
                    result={this.state.result}
                    step={this.state.step}
                    delay={this.state.delay}
                    runCode={this.runCode}
                    onPreviousStepClick={this.onPreviousStepClick}
                    onNextStepClick={this.onNextStepClick}
                    onSimulationSpeedChange={this.onSimulationSpeedChange}
                    onConsoleInput={this.onConsoleInput}
                />
            </>
        );
    }

    addNewSourceFile() {
        if (this.state.sourceFiles.length === 0) {
            this.setState({
                contentIDCounter: this.state.contentIDCounter+1,
                sourceFiles: this.state.sourceFiles.concat(
                    [
                        {
                            _id: "NEW " + this.state.contentIDCounter,
                            package: "main",
                            name: "Main",
                            code: "package main;\n" + 
                            "\n" + 
                            "import java.util.*;\n" + 
                            "import java.io.*;\n" + 
                            "import java.math.*;\n" + 
                            "\n" + 
                            "import java.io.Console;\n" + 
                            "\n" + 
                            "public class Main {\n" + 
                            "    \n" + 
                            "    public static void main(String[] args) {\n" + 
                            "// main_method_body\n" + 
                            "    }\n" + 
                            "    \n" + 
                            "}"
                        }
                    ]
                )
            });
        } else {
            this.setState({
                contentIDCounter: this.state.contentIDCounter+1,
                sourceFiles: this.state.sourceFiles.concat(
                    [
                        {
                            _id: "NEW " + this.state.contentIDCounter,
                            package: "main",
                            name: "",
                            code: ""
                        }
                    ]
                )
            });
        }
    }

    addNewTitle() {
        this.setState({
            contentIDCounter: this.state.contentIDCounter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.contentIDCounter,
                        type: "title",
                        text: ""
                    }
                ]
            )
        });
    }

    addNewText() {
        this.setState({
            contentIDCounter: this.state.contentIDCounter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.contentIDCounter,
                        type: "text",
                        text: ""
                    }
                ]
            )
        });
    }

    addNewCode() {
        this.setState({
            contentIDCounter: this.state.contentIDCounter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.contentIDCounter,
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
        let identifier = "";

        let containsEditor = false;
        for (let element of this.state.content) {
            if (element.type === "editor") {
                containsEditor = true;
                break;
            }
        }

        if (!containsEditor) {
            identifier = "main_method_body";
        }

        this.setState({
            contentIDCounter: this.state.contentIDCounter+1,
            content: this.state.content.concat(
                [
                    {
                        _id: "NEW " + this.state.contentIDCounter,
                        type: "editor",
                        identifier: identifier,
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



    deleteContent(id) {
        this.setState({
            content: this.state.content.filter((c) => c._id !== id)
        });
    }

    
    deleteSourceFile(id) {
        this.setState({
            sourceFiles: this.state.sourceFiles.filter((c) => c._id !== id)
        });
    }



    moveContent(id, moveUp) {
        let index = this.getIndexOfContent(id);

        if (index === -1) {
            console.error("No exercise content found!");
            return;
        }

        if (moveUp) {
            let newContent = this.array_move(this.state.content, index, index-1);
            this.setState({
                content: newContent
            });
        } else {
            let newContent = this.array_move(this.state.content, index, index+1);
            this.setState({
                content: newContent
            });
        }
    }

    moveSourceFile(id, moveUp) {
        let index = this.getIndexOfSourceFile(id);

        if (index === -1) {
            console.error("No exercise source file found!");
            return;
        }

        if (moveUp) {
            let newSourceFiles = this.array_move(this.state.sourceFiles, index, index-1);
            this.setState({
                sourceFiles: newSourceFiles
            });
        } else {
            let newSourceFiles = this.array_move(this.state.sourceFiles, index, index+1);
            this.setState({
                sourceFiles: newSourceFiles
            });
        }
    }

    array_move(original_array, old_index, new_index) {
        let arr = original_array.slice();
        while (old_index < 0) {
            old_index += arr.length;
        }
        while (old_index >= arr.length) {
            old_index -= arr.length;
        }
        while (new_index < 0) {
            new_index += arr.length;
        }
        while (new_index >= arr.length) {
            new_index -= arr.length;
        }
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr;
    };
    

    onChangeExerciseName(e) {
        this.setState({
            name: e.target.value
        });
    }

    onChangeExerciseContent(e) {
        let index = this.getIndexOfContent(e.target.name);

        if (index === -1) {
            console.error("No exercise content found!");
            return;
        }

        const newContent = [...this.state.content]
        newContent[index].text = e.target.value;
        this.setState({content: newContent});
    }

    onChangeExerciseAceEditor(e, value, id, key, keySettings) {
        key = key || "code"; // code, solution, identifier, package, name, settings (minLines)

        let index = this.getIndexOfContent(id);

        if (index === -1) {
            index = this.getIndexOfSourceFile(id);
            if (index === -1) {
                console.error("No exercise content found!");
                return;
            } else {
                const newSourceFiles = [...this.state.sourceFiles]
                newSourceFiles[index][key] = value;
                this.setState({
                    sourceFiles: newSourceFiles,
                    didChangeCode: true
                });
            }
        } else {
            if (key === "settings") {
                const newContent = [...this.state.content]
                newContent[index].settings[keySettings] = value;
                this.setState({content: newContent});
            } else {
                const newContent = [...this.state.content]
                newContent[index][key] = value;
                this.setState({content: newContent});
                if (key === "code" || key === "solution") {
                    this.setState({didChangeCode: true});
                }
            }
        }


    }

    getIndexOfContent(id) {
        let index = -1;
        let i = 0;
        for (let currentContent of this.state.content) {
            if (currentContent._id === id) {
                index = i;
                break;
            }
            i++;
        }
        return index;
    }

    getIndexOfSourceFile(id) {
        let index = -1;
        let i = 0;
        for (let currentSourceFile of this.state.sourceFiles) {
            if (currentSourceFile._id === id) {
                index = i;
                break;
            }
            i++;
        }
        return index;
    }



    
    exportExerciseAsJSON() {

        let sourceFiles = [];
        for (let sourceFile of this.state.sourceFiles) {
            let newSourceFile = {
                package: sourceFile.package,
                name: sourceFile.name,
                code: sourceFile.code
            }
            sourceFiles.push(newSourceFile);
        }

        let content = [];
        for (let c of this.state.content) {
            let newContent = {
                type: c.type,
                text: c.text,
                identifier: c.identifier,
                code: c.code,
                solution: c.solution,
                settings: c.settings
            }
            content.push(newContent);
        }

        let exercise = JSON.stringify({
            name: this.state.name,
            content: content,
            source_files: sourceFiles
        });

        this.setState({
            exportExerciseField: exercise
        });
    }

    
    onSubmit(e) {
        e.preventDefault();

        if (this.state.name === '') {
            return;
        }

        
        // removes id from new content entries so that the database gives it an accual id
        const content = this.state.content.map(function(currentContent) {
            if (currentContent._id.startsWith("NEW ")) {
                delete currentContent["_id"];
                return currentContent;
            } else {
                return currentContent;
            }
        });

        const sourceFiles = this.state.sourceFiles.map(function(sourceFile) {
            if (sourceFile._id.startsWith("NEW ")) {
                delete sourceFile["_id"];
                return sourceFile;
            } else {
                return sourceFile;
            }
        });
        
        const exercise = {
            id: this.state.id,
            name: this.state.name,
            content: content,
            source_files: sourceFiles
        }
        console.log(exercise);

        Axios.put('http://localhost:4000/exercise', exercise)
        .then(res => {
            console.log(res.data);
            this.props.history.push('/exercises');
        });
    }









    onConsoleInput(e, value) {
        console.log(value);
        e.preventDefault()

        let data = {
            input: value
        }

        let options = {
            timeout: 60*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };

        Axios.post('http://localhost:4000/exercise/input', data, options)
            .then(response => {
                if (response.status === 200) {
                    console.log(response);
                    this.saveCodeResponse(response.data, this.state.result.steps.length-1);
                } else {
                    console.log(response);
                    // TODO stop code execution because something went wrong
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }



    runCode(e) {

        // TODO add delay of 5 seconds before making another request as well as a spinning button
        // TODO only rerun code result if code does not contain user inputs (OR: SPLIT RERUN AND RUN (when input))

        if (!this.state.didChangeCode) {
            this.setState({
                step: 0
            });
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
            console.log("Rerun code!");
            return;
        }

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
            timeout: 60*1000, // TODO adjust?
            // responseType: 'stream',
            maxContentLength: 1000000000,
            headers: {
                "Content-Type": "application/json"
            }
        };
        
        Axios.post('http://localhost:4000/exercise/run', data, options)
            .then(response => {
                if (response.status === 200) {
                    console.log(response);
                    this.saveCodeResponse(response.data, 0);
                }
            })
            .catch(function (error) {
                console.error(error);
            });
    }

    saveCodeResponse(json, startAtStep) {

        console.log(json);

        if (json && json.steps && json.steps.length > 0) {
            if (timeout !== null) {
                clearTimeout(timeout);
            }
            this.setState({
                result: json,
                step: startAtStep,
                didChangeCode: false
            });
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
        }
        
    }

    simulateNextStep() {
        console.log("step: " + this.state.step + " " + this.state.result.steps[this.state.step].valueType + " " + this.state.result.steps[this.state.step].value);
        // SAVE ENTIRE STATE DATA PER STEP (JSON LARGER BUT LESS SIMULATION ON THIS END REQUIRED, EASIER BACK AND FORTH)
        // OR SAVE CHANGES MADE ON EACH STEP (JSON SMALLER BUT HAVE TO SIMULATE ON THIS END. HAVE TO REDO OR SAVE PREVIOUS SIMULATED STATES, COULD ADD FILTER OR BREAKPOINTS)
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0 && (this.state.step+1) < this.state.result.steps.length) {
            this.setState({
                step: this.state.step+1
            });
            timeout = setTimeout(this.simulateNextStep, this.state.delay);
        } else {
            clearTimeout(timeout);
        }

    }
    
    
    onSimulationSpeedChange(key, event) {
        const delay = parseInt(key);
        this.setState({
            delay: delay
        });

    }

    onNextStepClick(e) {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            if ((this.state.step+1) < this.state.result.steps.length) {
                this.setState({
                    step: this.state.step+1
                });
            } else {
                this.setState({
                    step: 0
                });
            }
        }
    }

    onPreviousStepClick(e) {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        if (this.state.result && this.state.result.steps && this.state.result.steps.length > 0) {
            if ((this.state.step-1) >= 0) {
                this.setState({
                    step: this.state.step-1
                });
            } else {
                this.setState({
                    step: this.state.result.steps.length-1
                });
            }
        }
    }
    
}