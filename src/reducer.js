import { struct, shiftKeyPath, getContext } from './util';

/**
 * @param {Object} state
 * @param {Object} action
 * @param {String} action.type
 * @param {Function<state, action>} reducer
 * @returns {Object|undefined}
 */
export function reduceChildren(state, action, reducer = _=>_) {
  const [key, path] = shiftKeyPath(action.type);
  const ctx = getContext(key, state);
  const ctxAction = Object.assign({}, action, { type: path });
  const slice = reducer(ctx, ctxAction);
  if(!!ctx) {
    state[key] = slice;
  }

  return state;
}

/**
 * @param {Object} children A map of child reducers keyed by their relative store name
 * @param {Function<Object, Object>} ownReducer The reducer for this level's slice of state
 * @returns {function(*=, *=)}
 */
export function createReducerTree(children, ownReducer) {
  return (state=struct(children), action) => {
    const mergeObjects = [];
    const [reducerKey,] = shiftKeyPath(action.type);
    const childState = reduceChildren(state, action, children[reducerKey]);
    const ownState = ownReducer(state, action);

    if(childState) {
      mergeObjects.push(childState);
    }

    mergeObjects.push(ownState);
    return Object.assign({}, ...mergeObjects);
  }
}
