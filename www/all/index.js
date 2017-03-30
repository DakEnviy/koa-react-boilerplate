
import React from 'react';
import ReactDOM from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import { Provider } from 'react-redux';

import * as api from './api';

function renderApp (store, props) {
  return ReactDOM.renderToString(
    <Provider store={store}>
      <RouterContext {...props} />
    </Provider>
  );
}

/**
 * Setup React router server side rendering
 */

function *all (next) {
  const routes = require('../../app/routes').default; // enable hot reload server-side
  const createMainStore = require('../../app/store').default; // enable hot reload server-side
  let location = this.url;
  let redirectLocation, renderProps;

  // Use react-router match() to check if valid route
  try {
    [ redirectLocation, renderProps ] = yield match.bind(this, { routes, location });
  } catch (err) {
    this.throw(500, err.message);
  }

  if (redirectLocation) {
    return this.redirect(redirectLocation.pathname + redirectLocation.search, '/');
  }

  if (!renderProps) {
    return this.throw(404);
  }

  /**
   * If you are NOT intersted in server-side rendering
   * then replace following code with just:
   *
   * this.render(__dirname, 'index', {});
   */

  // Provide a customised thunk middleware
  // that queues async actions to resolve them later
  let asyncActions = [];
  let thunkMiddleware = {
    withExtraArgument (arg) {
      return function thunk ({ dispatch, getState }) {
        return (nxt) => (action) =>
          (typeof action === 'function')
            ? asyncActions.push(action(dispatch, getState, arg))
            : nxt(action);
      };
    },
  };

  const store = createMainStore({}, api, thunkMiddleware);
  let html = renderApp(store, renderProps);
  if (asyncActions.length) {
    yield asyncActions;
    html = renderApp(store, renderProps);
  }
  this.renderSync(__dirname, 'index', {
    html, state: store.getState(),
  });
}


const ROUTES = {
  'GET *': all,
};

export default ROUTES;
