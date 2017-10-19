import { shiftKeyPath } from './util';

/**
 * Enumerates child context from parent
 * @param {String} key
 * @param {String} path
 * @param {*} state
 * @param {Object} action
 * @param {Boolean} recontextActions Flag for whether action types should be recontextualized in the process or not
 * @returns {[ctx, action]}
 */
function deriveChildContext(key, path, state, action, recontextActions=true) {
  let ctx;
  const ctxAction = recontextActions ? { ...action, type: path }: action;

  if(state && key in state) {
    ctx = state[key];
  }

  return [ctx, ctxAction];
}

/**
 * @param {Object} children A map of child reducers keyed by their relative store name
 * @returns {function(*=, *=)}
 */
export function createReducerTreeWithContext(children) {
  // const initialState = {};
  // const childKeys = Object.keys(children);

  // childKeys.forEach(key => {
  //   initialState[key] = children[key](undefined, { type: '' });
  // });

  // return function (state, action) {

    // console.log(children);
    // console.log(state, action);

    // if(children) {
    //   const childState = {};
    //   const [, path] = shiftKeyPath(action.type);
    //   const childKeys = Object.keys(children);
    //   childKeys.forEach(key => {
    //     const reducer = children[key];
    //     if(typeof(reducer) === 'function') {
    //       const [ctx, ctxAction] = deriveChildContext(key, path, state, action);
    //       childState[key] = reducer(ctx, ctxAction);
    //     } else {
    //       debugger;
    //       // console.log(reducer);
    //     }
    //   });
    //   return childState;
    // }


    // return state;
  // };
}


export function createReducerTreeWithoutContext(children) {
  return (state, action) => {
    const childKeys = Object.keys(children);

    if(childKeys.length > 0) {
      const [reducerKey, path] = shiftKeyPath(action.type);

      const childState = {};
      childKeys.forEach(key => {
        const childReducer = children[key];
        const [ctx, ctxAction] = deriveChildContext(key, path, state, action, false);
        childState[key] = childReducer(ctx, ctxAction);
      });

      return childState;
    }
  };
}

/**
 * Recursively reduce the state tree
 * @param {Function<Function>} reducers
 * @param {Object} ctx
 * @param {Object} ctxAction
 * @returns {Object}
 */
export function reduceTree(reducers, ctx, ctxAction) {
  let nextCtx = Object.assign({}, ctx);

  Object.keys(reducers || {}).forEach(key => {
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

/**
 * Same as redux combineReducers, just without the unexpected keys warnings
 * @param {Object<Function>} reducers
 * @returns {function(*, *=)}
 */
export function combineReducers(reducers) {
  return (state, action) => {
    return Object.keys(reducers).reduce(
      (nextState, key) => {
        nextState[key] = reducers[key](
          state[key],
          action
        );
        return nextState;
      },
      {}
    )
  }
}