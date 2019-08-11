import React, {Component} from 'react';

export default class ProgressArrows extends Component {

    render () {
		return <div>
			<div className="progress-arrows-wrap">
				{
					this.props.arrows !== undefined &&
					this.props.arrows.map((value, i) => {
							const arrowWidth = Math.min(((((1/this.props.arrows.length)*100))-(0.5)), 6)+"%";
							let style = { width:arrowWidth, zIndex: 10, marginLeft:"5px"};
							let arrowType = "neutral";
							if (this.props.data && this.props.data[value._id] && this.props.data[value._id].solved) {
								arrowType = "completed";
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
							let boxShadowClass = "progress-arrow-boxshadow";
							if (this.props.current && this.props.current === value._id) {
								boxShadowClass = "progress-arrow-boxshadow-selected";
							}
							return <div
								style={style}
								className={"progress-arrow progress-arrow-neutral " + boxShadowClass}
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
