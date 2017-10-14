import { shiftKeyPath } from './util';

/**
 * Enumerates child context from parent
 * @param {String} key
 * @param {String} path
 * @param {*} state
 * @param {Object} action
 * @returns {[ctx, action]}
 */
function deriveChildContext(key, path, state, action) {
  let ctx;
  const ctxAction = { ...action, type: path };
  // console.log(ctxAction);

  if(state && key in state) {
    ctx = state[key];
  }

  return [ctx, ctxAction];
}

/**
 * @param {Object} children A map of child reducers keyed by their relative store name
 * @param {Function<Object, Object>} ownReducer The reducer for this level's slice of state
 * @returns {function(*=, *=)}
 */
export function createReducerTree(children, ownReducer) {
  // state=struct(children)

  // Iiiiiiinteresting...
  // So, as long as an action path is well formed we can parse that to traverse child reducers
  // BUT, as seen with redux/@@INIT, other reducers are still called
  // In some instances this would be opportune to differentiate between default state and legit targeted reducer calls

  const finalReducer = (state, action) => {
    const [reducerKey, path] = shiftKeyPath(action.type);

    const childKeys = Object.keys(children);
    const childState = {};
    childKeys.forEach(key => {
      const childReducer = children[key];
      const [ctx, ctxAction] = deriveChildContext(key, path, state, action);
      childState[key] = childReducer(ctx, ctxAction);
    });

    const ownState = ownReducer(state, action);

    return { ...childState, ...ownState };
  };

  return finalReducer;
}
