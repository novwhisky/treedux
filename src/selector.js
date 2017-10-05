/**
 *
 * @param {String} keyPath
 * @param {Object} parentState
 * @returns {*}
 */
export function createSelectorTree(keyPath, parentState={}) {
  const ctx = parentState[keyPath];
  return Object.assign({}, ctx);
}
