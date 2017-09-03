/**
 * Loops through map of reducers invoking each with state argument left undefined
 * This has the effect of scaffolding each element's initial state
 * @param {Object<Function>} reducerMap
 * @returns {Object}
 */
export function struct(reducerMap) {
  const state = {};
  Object.keys(reducerMap).forEach(key => state[key] = reducerMap[key](undefined, {}));
  return state;
}

/**
 * Traverse down object properties using dot-notation
 * This function stops one short of the final value to return its _context_
 * e.g. Given myObject = { A:{ B:{ C:{ D:true } } } }, getContext('A.B.C.D', myObject)
 * would return 'A.B.C's value: { D: true }
 * @param {Array|String} keyPath
 * @param {Object} state
 * @returns {*}
 */
export function getContext(keyPath, state) {
  if(typeof(keyPath) === 'string') {
    return getContext(keyPath.split('.'), state);
  }

  const [key, ...path] = keyPath;
  return (path.length > 1) ? getContext(path, state[key]): state[key];
}

/**
 * @param keyPath
 * @returns {Array<String, String>}
 */
export function shiftKeyPath(keyPath) {
  const [key, ...path] = keyPath.split('.');
  return [key, path.join('.')];
}

/**
 * @param {Object} state
 * @param {Object} action
 * @param {String} action.type
 * @param {Function<state, action>} reducer
 * @returns {Object|undefined}
 */
export function reduceChild(state, action, reducer = _=>_) {
  const [key, path] = shiftKeyPath(action.type);
  const ctx = getContext(key, state);
  const slice = reducer(ctx, { type: path });
  if(!!ctx)
    return { [key]: slice };
}

/**
 * @param {Object} children A map of child reducers keyed by their relative store name
 * @param {Function<Object, Object>} ownReducer The reducer for this level's slice of state
 * @returns {function(*=, *=)}
 */
export function createReducerTree(children, ownReducer) {
  return (state=struct(children), action) => {
    const ownState = ownReducer(state, action);
    const [reducerKey,] = shiftKeyPath(action.type);
    const slice = reduceChild(state, action, children[reducerKey]);

    // Shallow merge. Because of precedence, this should be improved to prevent slice clobbering the parent state.
    return Object.assign({}, ownState, slice);
  }
}
