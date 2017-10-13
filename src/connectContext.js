import { connect, connectAdvanced } from 'react-redux';
import { object, string, func } from 'prop-types';

import { selectorFromKeyPath } from './util';

function makeConnectContext(contextFactoryArgs, mapSliceToProps=_=>({}), mapDispatchToProps) {
  const [keyPath, reducer] = contextFactoryArgs;

  // console.log(...arguments);

  const sliceSelector = selectorFromKeyPath(keyPath);
  // const sliceSelector = _=>_;

  return function wrapComponent(ReactComponent) {
    // yolo
    // const Connect = connect()(ReactComponent);

    function makeSelectorStateful(sourceSelector, store, sliceSelector) {
      // wrap the selector in an object that tracks its results between runs.
      const selector = {
        run: function runComponentSelector(props) {
          try {
            const nextProps = sourceSelector(/*sliceSelector(*/store.getState()/*)*/, store.getState(), props)
            // console.log(nextProps);
            if (nextProps !== selector.props || selector.error) {
              selector.shouldComponentUpdate = true
              selector.props = nextProps
              selector.error = null
            }
          } catch (error) {
            selector.shouldComponentUpdate = true
            selector.error = error
          }
        }
      }

      return selector
    }

    function selectorFactory(dispatch, options) {
      let ownProps = {};
      let result = {};

      return function sourceSelector(/*ctx, */nextState, nextOwnProps) {

        const nextSlice = sliceSelector(nextState) || {};
        const nextCtx = mapSliceToProps(nextSlice);

        const nextResult = { ...nextOwnProps, ...nextCtx };
        ownProps = nextOwnProps;
        result = nextResult;
        return result;
      };
    }

    const Connect = connectAdvanced(selectorFactory)(ReactComponent);

    class Context extends Connect {
      constructor(props, context) {
        super(props, context);

        // const sliceSelector = context.sliceSelector || (_=>_);
        // const sourceSelector = selectorFactory(this.store.dispatch, {});
        // this.selector = makeSelectorStateful(sourceSelector, this.store /*, sliceSelector*/);
        // this.selector.run(props);


        this.mountReducer();
      }

      getChildContext() {
        const { store, storeSubscription, keyPath: parentKeyPath } = this.context;

        // const keyPath = `${}`

        let namespace = '';
        if(parentKeyPath) {
          namespace = `${parentKeyPath}.`;
        }

        return {
          store,
          storeSubscription,
          keyPath: namespace + keyPath
        }
      }

      mountReducer() {
        // Recursion trap
        /*if(true || this.store.reducerLib.getReducer(keyPath) !== reducer) {*/
          this.store.mount(keyPath, reducer);
        /*}*/


        // console.log(keyPath, reducer);
        // this.store.mount(keyPath, reducer);
        // Nah
        // this.store.replaceReducer(this.store.reducerLib.makeReducerTree());
      }
    }

    Context.displayName = 'Context(' + ReactComponent.name + ')';

    Context.childContextTypes = Context.contextTypes = {
      keyPath: string,
      store: object,
      storeSubscription: object,
      sliceSelector: func
    };

    return Context;
    // return Connect;

    /*
    function Context(props, context) {

      let nextSliceSelector;

      const nextKeyPath = (context.keyPath ? [context.keyPath, keyPath]: [keyPath]).join('.');

      // const nextSliceSelector = (context && context.sliceSelector) ?
      //   state => sliceSelector(context.sliceSelector(state)):
      //   state => sliceSelector(state);



      // if(reducer && nextKeyPath) {
      //   if(typeof reducer === 'function') {
      //     console.log('[MOUNT]', nextKeyPath, reducer);
      //     // context.store.mount(nextKeyPath, reducer);
      //     context.store.reducerLib.mount(nextKeyPath, reducer);
      //   }
      //   else {
      //     console.error(`Invalid reducer argument in ${keyPath}, expected a Function`);
      //   }
      // }

      // console.log(context);
      if(context && context.sliceSelector) {
        nextSliceSelector = state => sliceSelector(context.sliceSelector(state));
      }
      else {
        nextSliceSelector = state => sliceSelector(state);
      }

      const mapStateToProps = state => {
        console.log('state', state);
        const slice = nextSliceSelector(state) || {};
        // console.log('slice', slice);
        const mapping = mapSliceToProps(slice) || {};
        // console.log('mapping', mapping);
        return mapping || {};
      };

      const Connect = connect(mapStateToProps, mapDispatchToProps)(ReactComponent);

      Connect.childContextTypes = Connect.contextTypes = {
        keyPath: string,
        store: object,
        storeSubscription: object,
        sliceSelector: func
      };

      Connect.prototype.getChildContext = function() {
        return { ...context, sliceSelector: nextSliceSelector, keyPath: nextKeyPath };
      };

      // Connect.prototype.componentDidMount = function() {
        if(reducer && nextKeyPath) {
          if(typeof reducer === 'function') {
            console.log('[MOUNT]', nextKeyPath, reducer);
            // context.store.mount(nextKeyPath, reducer);
            context.store.reducerLib.mount(nextKeyPath, reducer);
          }
          else {
            console.error(`Invalid reducer argument in ${keyPath}, expected a Function`);
          }
        }
      // };

      return new Connect(props, context);
    }

    Context.childContextTypes = Context.contextTypes = {
      keyPath: string,
      store: object,
      storeSubscription: object,
      sliceSelector: func
    };
    */

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
export function context (keyPath, reducer) { // keyPath, reducer
  // convert keyPath to dynamic sliceSelector
  if(!keyPath) {
    console.error('Missing required parameter for binding context(): {String} keyPath');
    return;
  }

  return function contextFactory(wrapComponentWithContext) {
    return wrapComponentWithContext(keyPath, reducer);
  }
}