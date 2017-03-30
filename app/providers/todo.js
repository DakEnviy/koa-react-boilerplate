import { keyBy, map, union, pickBy } from 'lodash';
import { createAction, handleActions } from 'redux-actions';
import { createSelector } from 'reselect';

/**
 * Action types
 */

export const types = {
  LOAD: 'TODO_LOAD',
  ADD: 'TODO_ADD',
  REMOVE: 'TODO_REMOVE',
};

/**
 * Reducer
 */

const defaultState = {
  byId: {},
  ids: [],
};

export const reducer = handleActions({

  [types.LOAD] (state, { payload }) {
    return {
      byId: keyBy(payload, (m) => m.id),
      ids: map(payload, (m) => m.id),
    };
  },

  [types.ADD] (state, { payload }) {
    let entities = [].concat(payload);
    let byId = keyBy(entities, (m) => m.id);
    let orderedIds = map(entities, (m) => m.id); // better than Object.keys to preserve order
    return {
      byId: { ...state.byId, ...byId },
      ids: union(state.ids, orderedIds),
    };
  },

  [types.REMOVE] (state, { payload }) {
    let ids = [].concat(payload);
    return {
      byId: pickBy(state.byId, (ent) => ids.indexOf(ent.id) === -1),
      ids: state.ids.filter((id) => ids.indexOf(id) === -1),
    };
  },

}, defaultState);

/**
 * Selectors
 */

export const selectors = {
  getAll: createSelector(
    (state) => state.entities.todos,
    (collection) => {
      return collection.ids.map((id) => collection.byId[id]);
    }
  ),
};

/**
 * Actions
 */

export const actions = {

  load: createAction(types.LOAD),

  loadAsync () {
    // redux-thunk magic: it allow actions to return functions
    // w/ dispatch as argument, so we can call it as many times as needed
    return (dispatch, getState, api) => {
      return api.get('/todos')
        .then((resp) => {
          dispatch(actions.load(resp));
        });
    };
  },

  add: createAction(types.ADD),

  addAsync (text) {
    return (dispatch, getState, api) => {
      // optimisticly add todo
      let tmpTodo = { id: 0, text: `${text} (Saving...)` };
      dispatch(actions.add(tmpTodo));

      return api.post('/todos', {
        data: { text },
      })
        .then((resp) => {
          // remove optimistic todo and add server saved one
          dispatch(actions.remove(tmpTodo.id));
          dispatch(actions.add(resp));
        })
        .catch((err) => {
          actions.remove(tmpTodo.id);
          alert(err.message); // eslint-disable-line no-alert
        });
    };
  },

  remove: createAction(types.REMOVE),

};
