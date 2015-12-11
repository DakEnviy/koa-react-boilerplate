/**
 * Redux Actions
 */

import { TODOS } from '../../api/todos';

export function loadTodosImmediate(todos = []) {
  return {
    todos,
    type: 'LOAD_TODOS',
  };
}

export function loadTodos() {
  return (dispatch, getState) => {
    // Called on server side rendering,
    // we just store the logic into a queue on the store
    // that will be executed later by the koa router yield
    let action = (done) => {

      setTimeout(() => {
        dispatch(loadTodosImmediate(TODOS));
        // once fetched, resume the generetor
        done(null);
      }, 200);

    };

    getState().__queue(action);
  };
}