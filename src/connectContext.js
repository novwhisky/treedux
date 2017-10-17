import React, { createElement } from 'react';
import { connectAdvanced } from 'react-redux';
import { object, string, func } from 'prop-types';

import { selectorFromKeyPath } from './util';
import shallowEqual from './utils/shallowEqual';

function proxyActionCreator(keyPath, actionCreator, dispatch) {
  return function() {
    const originalAction = actionCreator(...arguments);
    const action = { ...originalAction, type: `${keyPath}.${originalAction.type}` };
    dispatch(action)
  }
}

function makeConnectContext(contextFactoryArgs, mapSliceToProps=_=>({}), mapDispatchToProps) {
  const [keyPath, reducer] = contextFactoryArgs;

  return function wrapComponent(ReactComponent) {

    function selectorFactory(dispatch, options) {
      let ownProps = {};
      let result = {};

      // sourceSelector
      return (nextState, nextOwnProps) => {
        // console.log(nextOwnProps);
        // console.log('nextState', nextState);

        const sliceSelector = selectorFromKeyPath(options.keyPath);
        const nextSlice = sliceSelector(nextState);
        // console.log('nextSlice', nextSlice);

        let nextCtx = {};
        if(nextSlice) {
          nextCtx = mapSliceToProps(nextSlice);
        }

        let actions = {};
        if(mapDispatchToProps) {
          if(typeof(mapDispatchToProps) === 'function') {
            // Can't proxy action types configured with bindActionCreators here.
            // Consider throwing an error if there's no usable option
            actions = mapDispatchToProps(dispatch, ownProps);
          } else if(mapDispatchToProps instanceof Object) {
            Object.keys(mapDispatchToProps).forEach(key => {
              actions[key] = proxyActionCreator(options.keyPath, mapDispatchToProps[key], dispatch);
            });
          }
        }

        const nextResult = { ...nextOwnProps, ...nextCtx, ...actions, dispatch };
        ownProps = nextOwnProps;
        if (!shallowEqual(result, nextResult)) {
          result = nextResult;
          // console.log('nextResult', nextResult);
        }
        return result;
      };
    }



    class Context extends React.Component {
      constructor(props, context) {
        super(props, context);

        this.store = context.store;
        this.mountReducer();
      }

      getNamespace() {
        let parentNamespace = '';
        const { keyPath: parentKeyPath } = this.context;
        if(parentKeyPath) {
          parentNamespace = `${parentKeyPath}.`;
        }
        return parentNamespace + keyPath
      }

      getChildContext() {
        const { store, storeSubscription } = this.context;

        return {
          keyPath: this.getNamespace(),
          store,
          storeSubscription
        }
      }

      mountReducer() {
        const namespace = this.getNamespace();

        if(namespace) {
          this.store.mount(namespace, reducer);
        }
      }

      render() {
        const options = {
          // getDisplayName: name => 'Context(' + name + ')',
          keyPath: this.getNamespace()
        };

        const Connect = connectAdvanced(selectorFactory, options)(ReactComponent);
        return createElement(Connect, this.props);
      }
    }

    Context.childContextTypes = Context.contextTypes = {
      keyPath: string,
      store: object,
      storeSubscription: object,
    };

    return Context;
  };

}


/**
 * @param {Function} mapSliceToProps
 * @param {Function} [mapDispatchToProps]
 * @returns {Function}
 */
export function connectToContext (mapSliceToProps, mapDispatchToProps) {
  return function connectToContextFactory(ReactComponent) {
    return function wrapComponentWithContext(keyPath, reducer) {
      const connected = makeConnectContext([keyPath, reducer], mapSliceToProps, mapDispatchToProps);
      const Connect = connected(ReactComponent);

      return Connect;
    }
  }
}

/**
 * @param {String} keyPath
 * @param {Function} reducer
 * @returns {Function|undefined}
 */
export function context (keyPath, reducer) {
  // convert keyPath to dynamic sliceSelector
  if(!keyPath) {
    console.error('Missing required parameter for binding context(): {String} keyPath');
    return;
  }

  return function contextFactory(wrapComponentWithContext) {
    return wrapComponentWithContext(keyPath, reducer);
  }
}