import React, { Component } from "react";

export default class PokerEditPoints extends Component {
    constructor(props) {
        super(props);
        this.editItem = props.editItem;
        this.handleChange = this.handleChange.bind(this);
        this.state={
            item: props.item,
            index: props.index,
            entered_text: ""
        }
    }

    handleChange(event) {
        this.setState({
            entered_text: event.target.value
        });
    }

    render() {
        return (
            <form onSubmit={e => this.props.editItem(e, this.state.item, this.state.index, this.state.entered_text)}>
                <h4><input type="text" value={this.state.entered_text} onChange={this.handleChange} /></h4>
                <input type="submit" value="Save Text" />
            </form>
        );
    }
}