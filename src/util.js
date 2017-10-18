/**
 * Loops through map of reducers invoking each with state argument left undefined
 * This has the effect of scaffolding each element's initial state
 * @param {Object<Function>} reducerMap
 * @returns {Object}
 */
export function struct(reducerMap) {
  const state = {};
  Object.keys(reducerMap).forEach(key => {
    state[key] = reducerMap[key](undefined, { type: '' });
  });
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
 * @param {String} keyPath
 * @param {*} targetValue
 * @returns {Object}
 */
export function scaffold(keyPath, targetValue={}) {
  const stateCopy = {};
  const [key, path] = shiftKeyPath(keyPath);

  if(path.length > 0) {
    stateCopy[key] = scaffold(path, targetValue);
  }
  else {
    stateCopy[key] = targetValue;
  }

  return stateCopy;
}


export function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

/**
 * @param {Object} target
 * @param {Object} source
 * @returns {*}
 */
export function mergeDeep(target, source) {
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target))
          Object.assign(output, { [key]: source[key] });
        else
          output[key] = mergeDeep(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
}

export function selectorFromKeyPath(keyPath) {
  if(Array.isArray(keyPath)) {
    const [key, ...path] = keyPath;
    const selector = state => state && state[key];

    if(path && path.length > 0) {
      return state => selectorFromKeyPath(path)(selector(state));
    }
    else if(key && key.length > 0) {
      return selector;
    }
    else {
      return _=> {};
    }
  }
  else {
    return selectorFromKeyPath(keyPath.split('.'));
  }
}
