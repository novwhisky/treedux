import { bindActionCreators } from 'redux';

/**
 *
 * @param {String} keyPath
 * @param {Object<Function>} actionCreators
 * @returns {Object<Function>}
 */
export function actionCreatorTree(keyPath, actionCreators) {
  const tree = {};
  Object.keys(actionCreators).forEach(key => {
    tree[key] = function() {
      const action = actionCreators[key](...arguments);
      const ctxKey = [keyPath, action.type].join('.');
      const ctxAction = Object.assign(action, { type: ctxKey });
      return ctxAction;
    }
  });

  return tree;
}

/**
 *
 * @param {String} keyPath
 * @param {Object<Function>} actionCreators
 * @param {Function} dispatch
 * @returns {Object.<Function>}
 */
export function bindActionCreatorTree(keyPath, actionCreators, dispatch) {
  const tree = actionCreatorTree(keyPath, actionCreators);
  return bindActionCreators(tree, dispatch);
}
