import React, { PropTypes } from 'react';
import { map } from 'lodash';

import TodoItem from './item';

/**
 * TodoList component
 */

const propTypes = {
  todos: PropTypes.array,
};

const TodoList = ({ todos = [] }) => (
  <div className="TodoList">
    <h2>Todo list</h2>
    <ul>
      {map(todos, (todo, i) => (
        <TodoItem key={i} {...todo} />
      ))}
    </ul>
  </div>
);

TodoList.propTypes = propTypes;

export default TodoList;
