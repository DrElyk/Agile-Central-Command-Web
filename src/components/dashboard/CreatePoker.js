import React, { Component } from "react";
import { Modal, Button, Checkbox } from "react-bootstrap";
import "./Dashboard.css";

import TextFieldGroup from "../common/TextFieldGroup";
import DropDownMenu from "../common/DropDownMenu";

// redux imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { fetchStories } from "../../actions/sessionActions";
import update from "immutability-helper";

import IconButton from "@material-ui/core/IconButton";
import { MdAdd, MdRemove } from "react-icons/md";

class CreatePoker extends Component {
  constructor() {
    super();
    this.state = {
      title: "",
      description: "",
      card_type: "",
      velocity: 50,
      sessiontype: "poker",
      errors: {},
      sessionCreated: false,
      storySelection: [],
      isDisabled: false
    };

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    //this.props.fetchStories();
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
    if (
      this.state.title.indexOf("-") !== -1 ||
      this.state.title.indexOf(/\./) !== -1
    ) {
      this.setState({ isDisabled: true });
    } else {
      this.setState({ isDisabled: false });
    }
  }

  onChangeDropdown = selectedOption => {
    console.log(selectedOption.value);
    this.setState({ card_type: selectedOption });
  };

  chooseStoriesButton = async () => {
    await this.props.onSubmit(
      this.state.title.replace(/\s+/g, "-"),
      this.state.description,
      this.state.sessiontype,
      this.state.card_type,
      this.state.velocity
    );

    this.props.onClose();
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.session.sessionStories !== null) {
      const stories = Array.from(nextProps.session.sessionStories);
      stories.forEach(story => {
        story.selected = false;
        /*this.setState({
          stories: [...this.state.stories, story]
        });*/
      });

      this.setState({
        sessionCreated: true,
        storySelection: stories
      });

      /*this.setState({
        sessionCreated: true,
        storySelection: Array.from(nextProps.session.sessionStories)
      });

      this.state.storySelection.forEach(story =>
        this.setState({
          storySelection: update(this.state.storySelection, {
            [story]: { selected: { $set: false } }
          })
        })
      );*/
      console.log(this.state.storySelection);
    }
  }

  addStory = itemNum => {
    console.log(itemNum);
    this.setState({
      storySelection: update(this.state.storySelection, {
        [itemNum]: { selected: { $set: true } }
      })
    });
  };

  removeStory = itemNum => {
    this.setState({
      storySelection: update(this.state.storySelection, {
        [itemNum]: { selected: { $set: false } }
      })
    });
  };

  cancelButton() {
    this.setState({ title: "", description: "", card_type: "", velocity: 50 });
    this.props.onHide();
  }

  finalCreatePoker = () => {
    this.setState({
      title: "",
      description: "",
      velocity: 50,
      sessionCreated: false
    });

    this.props.onStorySelect(this.state.storySelection);
  };

  render() {
    return (
      <Modal {...this.props} size="lg">
        <Modal.Header>
          <Modal.Title>Create Planning Poker Session</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <form onSubmit={this.onSubmit}>
              <TextFieldGroup
                placeholder="Session Name"
                label="Session Name"
                name="title"
                type="text"
                value={this.state.title}
                onChange={this.onChange}
              />
              {this.state.isDisabled == true ? (
                <font color="red">
                  Session Name cannot contain a hyphen or period.
                </font>
              ) : (
                ""
              )}
              <p />

              <TextFieldGroup
                placeholder="Description"
                name="description"
                label="Description"
                type="text"
                multiline="true"
                value={this.state.description}
                onChange={this.onChange}
              />
              <p />

              <TextFieldGroup
                placeholder="Team Velocity"
                name="velocity"
                label="Velocity"
                type="text"
                multiline="true"
                value={this.state.velocity}
                onChange={this.onChange}
              />
              <p />

              <DropDownMenu
                name="card_type"
                value={this.state.card_type}
                onChange={this.onChangeDropdown}
              />
            </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div>
            <Button
              variant="outline-success"
              onClick={() => this.chooseStoriesButton()}
              disabled={this.state.isDisabled}
            >
              Select Stories
            </Button>
            <Button onClick={() => this.cancelButton()}>Cancel</Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}

CreatePoker.propTypes = {
  fetchStories: PropTypes.func.isRequired,
  session: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  session: state.session
});

export default connect(
  mapStateToProps,
  { fetchStories }
)(CreatePoker);
