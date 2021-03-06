import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import * as providers from '../../providers';
import TodoList from './atoms/list';
// import './style.scss';

import 'assets/icons/add.svg';

/**
 * Todos wrapper component
 */

class Todos extends Component {

  componentWillMount () { // fired on server + client
    let { todos, actions } = this.props;
    if (!todos.length) {
      actions.todo.loadAsync();
    }
  }

  handleTodoAdd () {
    let { actions } = this.props;
    actions.todo.addAsync('New todo');
  }

  render () {
    return (
      <div className="Todos">
        <TodoList {...this.props} />
        <button onClick={this.handleTodoAdd.bind(this)}>
          <svg width="24" height="24">
            <use xlinkHref="#i-add" />
          </svg>
          Add
        </button>
      </div>
    );
  }
}

export default connect(
  (state) => ({
    todos: providers.todo.selectors.getAll(state),
  }),
  (dispatch) => ({
    actions: {
      todo: bindActionCreators(providers.todo.actions, dispatch),
    },
  })
)(Todos);
