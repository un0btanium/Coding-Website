import React, {Component} from 'react';

import { Row, Col, Button} from 'react-bootstrap';

import { log } from '../../../services/Logger';


export default class ExerciseHTMLGUI extends Component {
    
    
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }

    render () {


        let guiElements = null;
        if (this.props.result && this.props.result.steps && this.props.step >= 0 && this.props.result.steps[this.props.step].type === "htmlGui") {
            log(this.props.result.steps[this.props.step].guiElements);
            const onConsoleInput = this.props.onConsoleInput;
            guiElements = this.props.result.steps[this.props.step].guiElements.map(function(guiRow, i) {
                let guiRowElements = guiRow.map(function(guiElement, i) {
                    let element = null;
                    switch(guiElement.type) {
                        case "square":
                            let rgbSquare = 'rgb(' + guiElement.color.red + ', ' + guiElement.color.green + ', ' + guiElement.color.blue + ')';
                            element = <Col key={"GUIElement" + i} style={{ width: '50px', height: '50px', margin: '2px', backgroundColor: rgbSquare }} >{guiElement.labelText}</Col>;
                            break;
                        case "button":
                            let rgbButton = 'rgb(' + guiElement.color.red + ', ' + guiElement.color.green + ', ' + guiElement.color.blue + ')';
                            element = <Button key={"GUIElement" + i} style={{ width: '50px', height: '50px', margin: '2px', backgroundColor: rgbButton }} onClick={(e) => { onConsoleInput(e, guiElement.id) }}>{guiElement.labelText}</Button>;
                            break;
                        default:
                            element = null;
                            break;
                    }
                    return element;
                })
                return <Row key={"GUIRow" + i}>{guiRowElements}</Row>;
            });

            return (
                <div  as={Row} style={{'marginBottom': '50px', 'marginTop': '30px', 'borderColor': '#666666', 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%'}}>
                    {guiElements}
                </div>
            );
        }

        return null;
    }


}