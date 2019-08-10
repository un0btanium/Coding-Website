import React, {Component} from 'react';

import Button from 'react-bootstrap/Button';

export default class ProgressArrows extends Component {

    render () {
		return <div>
			<div className="progress-arrows-wrap">
				{
					this.props.arrows !== undefined &&
					this.props.arrows.map((value, i) => {
							const arrowWidth = Math.min(((((1/this.props.arrows.length)*100))-(0.5)), 6)+"%";
							let style = { width:arrowWidth, zIndex: 10, marginLeft:"5px"};
							let arrowType = value;
							if (value !== "neutral" && value !== "completed" && value !== "started") {
								arrowType = "neutral";
							}
							return <div 
								style={style}
								className={"progress-arrow progress-arrow-"+arrowType}
								key={i}
								onClick={ (e) => (this.props.onClick ? this.props.onClick(e, i) : e.preventDefault())}
								onContextMenu={(e) => (this.props.onContextMenu ? this.props.onContextMenu(e, i) : e.preventDefault())}
							/>
						})
				}
			</div>
			<div className="progress-arrows-wrap" style={{ marginTop: "-35px"}}>
				{
					this.props.arrows !== undefined &&
					this.props.arrows.map((value, i) => {
							const arrowWidth = Math.min(((((1/this.props.arrows.length)*100))-(0.5)), 6)+"%";
							let style = { width:arrowWidth, zIndex: 5, marginLeft:"5px"};
							let arrowType = value;
							if (value !== "neutral" && value !== "completed" && value !== "started") {
								arrowType = "neutral";
							}
							return <div
								style={style}
								className={"progress-arrow progress-arrow-boxshadow progress-arrow-" + arrowType}
								key={i}
								onClick={ (e) => (this.props.onClick ? this.props.onClick(e, i) : e.preventDefault())}
								onContextMenu={(e) => (this.props.onContextMenu ? this.props.onContextMenu(e, i) : e.preventDefault())}
							/>
						})
				}
			</div>
		</div>
	}

}
