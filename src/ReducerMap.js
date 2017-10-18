import { shiftKeyPath } from './util';
import shallowEqual from './utils/shallowEqual';

function get(keyPath, obj) {
  const [key, ...path] = keyPath.split('.');
  const ctx = obj[key];
  if (path.length === 0) return ctx;
  else return get(path.join('.'), ctx);
}

function set(keyPath, obj, value) {
  const [key, ...path] = keyPath.split('.');
  const ctx = obj[key];
  if (path.length === 0) return obj[key] = value;
  else return set(path.join('.'), ctx, value);
}


const wm = new WeakMap();

export default class ReducerMap {
  constructor() {
    const defaultBoop = {
      // boop: true
    };

    function root(state = defaultBoop, action) {

      /**
       *
       * @param {Function<Function>} reducers
       * @param {Object} ctx
       * @param {Object} ctxAction
       * @returns {Object}
       */
      function makeReducerTree(reducers, ctx, ctxAction) {
        let nextCtx = Object.assign({}, ctx);

        Object.keys(reducers || {}).forEach(key => {
          // nextCtx[key] = reducers[key](
          //   ctx[key],
          //   action
          // )

          const nextReducers = reducers[key];

          const [, actionPath] = shiftKeyPath(ctxAction.type);
          const nextAction = { ...ctxAction, type: actionPath };

          nextCtx[key] = nextReducers(
            ctx[key],
            nextAction
          );

          if(key in nextCtx) {
            const nextReducerKeys = Object.keys(nextReducers);
            if(nextReducerKeys.length) {
              nextCtx[key] = makeReducerTree(nextReducers, nextCtx[key], nextAction);
            }
          }

        });

        return nextCtx;
      }

      const nextState = makeReducerTree(root, state, action);


      return shallowEqual(state, nextState) ? state: nextState;
    }

    wm.set(this, root);
  }

  mount(keyPath, reducer) {
    const reducerMap = wm.get(this);
    set(keyPath, reducerMap, reducer);
  }

  reducer() {
    return wm.get(this);
  }
}