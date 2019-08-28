import React, {Component} from 'react';

import { Form, Container, Row, Col, OverlayTrigger, Popover, Tabs, Tab } from 'react-bootstrap';

import { getLetterHeight, getLetterWidth } from '../../../services/FontDetector';

// import brace from 'brace';
import AceEditor from 'react-ace';
import 'brace/mode/java';
import 'brace/theme/monokai';
import 'brace/snippets/java';
import 'brace/ext/language_tools';
import 'brace/ext/searchbox';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faLightbulb } from '@fortawesome/free-solid-svg-icons'
import { faLightbulb as faLightbulbRegular } from '@fortawesome/free-regular-svg-icons'
export default class ExerciseEditor extends Component {
	
	constructor(props) {
		super(props);

		this.state = {
			codeType: this.props.mode === "solve" ? "code" : "solution"
		}
	}

    render () {
		
		if (this.props.highlighting && this.props.highlighting.currentStep === 0 && this.props.highlighting.codeType !== this.state.codeType) {
			this.setState({
				codeType: this.props.highlighting.codeType
			});
		}

		let highlightOverlay = null;
		if (this.props.highlighting &&
			this.props.highlighting.node !== undefined &&
			this.props.highlighting.subExerciseIndex === this.props.subExerciseIndex &&
			this.props.highlighting.node.identifier === this.props.content.identifier) {

            let node = this.props.highlighting.node;
            let sizeColumn = getLetterWidth();
            let sizeLine = getLetterHeight();

            let x = 46 + sizeColumn * (node.columnStart-1) + sizeColumn * (('' + ((this.props.content[this.props.highlighting.codeType].match(/\r\n|\r|\n/g) || '').length + 1)).length-1);
            let y = sizeLine * node.lineStart;

            let w;
            let h;
            if (node.lineStart === node.lineEnd) {
                w = sizeColumn * ((node.columnEnd - node.columnStart) + 1) + 2;
                h = sizeLine;
            } else {
                w = sizeColumn * ((node.columnStart+node.columnEnd) - 1) + 2;
                h = sizeLine * ((node.lineEnd - node.lineStart) + 1) + 2;
            }

            
            // let rgba = 'rgba(20, 171, 255, 0.3)';
            let rgba = 'rgba(255, 255, 32, 0.3)';
            if (this.props.highlighting.step.valueType === "boolean" || this.props.highlighting.step.valueType === "Boolean") {
                if (this.props.highlighting.step.value === "true") {
                    rgba = 'rgba(32, 255, 32, 0.3)';
                } else {
                    rgba = 'rgba(255, 32, 32, 0.3)';
                }
            }

            highlightOverlay =
                <div style={{position: 'relative'}}>
                    <OverlayTrigger
                        key="tooltipOverlayHighlighting"
                        placement="top"
                        delay={{'show': 0, 'hide': 128}}
                        overlay={
                            <Popover
                                style={{ padding: '15px',background: 'rgba(0,0,0, 0.8)', backgroundColor: 'rgba(0,0,0, 0.8)', textAlign: 'left', wordBreak: 'keep-all', whiteSpace: 'pre'}}
                                // arrowProps={style="{{background: 'rgba(0,0,0, 0.8)'}}"}
                                id="tooltipHighlighting"
                            >
                                {this.props.highlighting.step.action ? <><span><h6>{this.props.highlighting.step.action}</h6></span></> : null}
                                {this.props.highlighting.step.name ? <><span>{'variable name:   '+ this.props.highlighting.step.name}</span><br/></> : null}
                                {this.props.highlighting.step.valueType ? <><span>{'type:     '+ this.props.highlighting.step.valueType}</span><br/></> : null}
                                {this.props.highlighting.step.value ? <><span>{'value:   ' + this.props.highlighting.step.value}</span><br/></> : null}
                                {this.props.highlighting.step.isPostfix ? <><span>{'isPostfix:   ' + this.props.highlighting.step.isPostfix}</span><br/></> : null}
                                {this.props.highlighting.step.valueBefore ? <><span>{'value (before):   ' + this.props.highlighting.step.valueBefore}</span><br/></> : null}
                                {this.props.highlighting.step.valueAfter ? <><span>{'value (after):   ' + this.props.highlighting.step.valueAfter}</span><br/></> : null}
                            </Popover>
                        }
                    >
                        <div style={{position: 'absolute', width: w, height: h, left: x, top: y, backgroundColor: rgba, zIndex: '2'}}></div>
                    </OverlayTrigger>
                </div>;
		}
		
		let errorOverlay = null;
		if (this.props.highlighting && 
			this.props.highlighting.step.type === "error" &&
			this.props.highlighting.step.identifier === this.props.content.identifier &&
			this.props.highlighting.step.line !== undefined) {

				
			let sizeLine = getLetterHeight();
			let y = sizeLine * this.props.highlighting.step.line;

			errorOverlay = <div style={{position: 'relative'}}>
				<div style={{position: 'absolute', width: "43px", height: sizeLine, left: "0px", top: y, backgroundColor: 'rgba(255, 0, 0, 0.5)', zIndex: '5'}}></div>
			</div>;
		}

        if (this.props.mode === "solve") {
            return (<>
				<div style={{ position: 'relative', left: '-25px', top: '45px', marginTop: '-40px', zIndex: '-1' }}>
					<FontAwesomeIcon icon={faPen} style={{ margin: '0px', color:'#538135' }} />
                </div>
				{	
					this.props.showSolutionToggle && 
					<div style={{ position: 'relative', top: '50px', left: '97%', marginTop: '-25px', width: '20px', zIndex: '3' }}>
						
						<OverlayTrigger
							key="tooltipSolutionToggleButton"
							placement="top"
							delay={{'show': 0, 'hide': 128}}
							overlay={
								<Popover
									style={{ padding: '10px', background: 'rgba(0,0,0,0.8)', backgroundColor: 'rgba(0,0,0,0.8)', textAlign: 'left', wordBreak: 'keep-all', whiteSpace: 'pre'}}
									// arrowProps={style="{{background: 'rgba(0,0,0, 0.8)'}}"}
									id="tooltipSolution"
								>
									<b>{this.state.codeType === "code" ? "Show Solution" : "Hide Solution"}</b>
								</Popover>
							}
						>
							<FontAwesomeIcon
								icon={this.state.codeType === "code" ? faLightbulbRegular : faLightbulb}
								style={{ color:'#fcd303' }}
								onClick={() => this.setState({codeType: this.state.codeType === "code" ? "solution" : "code"}) }
							/>
						</OverlayTrigger>
					</div>
				}
				
                <Row style={{'marginLeft': '0px', 'marginBottom': '20px', 'marginTop': '20px', 'borderColor': (this.state.codeType === "code" ? '#538135' : '#53CC35'), 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%', boxShadow: '2px 2px 5px #000000'}}>
					{(this.props.highlighting && this.state.codeType === this.props.highlighting.codeType && highlightOverlay) || errorOverlay}
					<AceEditor	
						mode="java"
						theme="monokai"
						name={this.props.content._id}
						value={this.props.content[this.state.codeType]}
						width='100%'
						// cursorStart={1}
						onChange={(value, e) => { if (this.state.codeType === "code") { this.props.onChange(e, value, this.props.content._id); } }}
						onFocus={() => { this.props.setHighlighting(null) }}
						editorProps={{$blockScrolling: Infinity}}
						readOnly={this.state.codeType === "solution"}
						setOptions={{
							enableBasicAutocompletion: true,
							// enableLiveAutocompletion: true,
							enableSnippets: true,
							showLineNumbers: true,
							minLines: (this.props.content.settings ? this.props.content.settings.maxLines || 5 : 5),
							maxLines: Infinity,
							wrap: false,
							animatedScroll: true,
							autoScrollEditorIntoView: true,
							printMarginColumn: 200,
							fontSize: '18px',
							fontFamily: 'Consolas, "Courier New", Courier, monospace'
						}}
					/>
                    
                </Row>
			</>
            );
        } else if (this.props.mode === "edit") {
            return (
                <>
                    <Container>
                        <Row>
                            <Col sm={2}  style={{textAlign: 'right'}}>
                                <Form.Label style={{ 'marginTop': '5px'}}><h5>Identifier:</h5></Form.Label>
                            </Col>
                            <Col sm={4}>
                                <Form.Control
                                    style={{color: 'white', border: 'solid 2px', borderColor: 'rgb(223, 105, 26)', background: 'rgb(43, 62, 80)' }}
                                    plaintext="true"
                                    autoComplete="off"
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter identifier"
                                    name={this.props.content._id}
                                    value={this.props.content.identifier}
                                    onChange={(e) => { this.props.onChange(e, e.target.value, this.props.content._id, "identifier"); }}
                                />
                            </Col>
                        </Row>
                    </Container>
					
                    <Tabs
						style={{width: "100%"}}
                        id="controlled-tab-exercise"
                        activeKey={this.state.codeType}
                        onSelect={(codeType) => this.setState({ codeType })}
                    >
						<Tab variant="primary" eventKey="code" title="Code" style={{width: "100%"}}></Tab>
						<Tab variant="primary" eventKey="solution" title="Solution" style={{width: "100%"}}></Tab>
					</Tabs>
					<div style={{'marginLeft': '0px', 'borderColor': (this.state.codeType === "code" ? '#538135' : '#53CC35'), 'borderRadius': '6px', 'borderWidth': '8px', 'borderStyle': 'solid', 'width': '100%', boxShadow: '2px 2px 5px #000000'}}>
						{(this.props.highlighting && this.state.codeType === this.props.highlighting.codeType && highlightOverlay) || errorOverlay}
						<AceEditor
							mode="java"
							theme="monokai"
							name={this.props.content._id}
							width='100%'
							value={this.props.content[this.state.codeType]}
							onChange={(value, e) => { this.props.onChange(e, value, this.props.content._id, this.state.codeType); }}
							// cursorStart={1}
							editorProps={{$blockScrolling: Infinity}}
							setOptions={{
								enableBasicAutocompletion: true,
								// enableLiveAutocompletion: true,
								enableSnippets: true,
								showLineNumbers: true,
								minLines: (this.props.content.settings ? this.props.content.settings.minLines || 5 : 5),
								maxLines: Infinity,
								wrap: false,
								animatedScroll: true,
								autoScrollEditorIntoView: true,
								printMarginColumn: 200,
								fontSize: '18px',
								fontFamily: 'Consolas, "Courier New", Courier, monospace'
							}}
						/>
					</div>
                </>
            );
        }
    }
}