import path from 'path';
import koaRouter from 'koa-router';
import { forEach } from 'lodash';
import pug from 'pug';
import config from '../lib/config';
import errorHandler from './errors';

// import and combine all routes
import allRoutes from './all';

export const routes = {
  ...allRoutes,
};

export const router = koaRouter({
  prefix: '/',
});

export default function setup (app) {
  // add global error handling
  errorHandler(app);

  const global = {
    ENV: config.env,
    CONFIG_CLIENT: config.client,
  };

  // Enhance context with .render() template method
  app.use(function *(next) {
    function getTpl (tplPath, name) {
      return pug.compileFile(path.join(tplPath, 'templates', name + '.pug'));
    }

    Object.assign(this, {
      renderSync (routePath, tplName, locals = {}) {
        this.type = 'text/html';
        this.body = getTpl(routePath, tplName)({ global, ...locals });
      },
    });
    yield next;
  });

  // add all routes to router
  forEach(routes, (fn, key) => {
    let [ method, routePath ] = key.split(' '); // eg: GET /foo/:id
    router[method.toLowerCase()](routePath, fn);
  });

  // attach router middleware
  app.use(router.routes());
}
