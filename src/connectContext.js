import { connect } from 'react-redux';
import { object, string, func } from 'prop-types';

function makeConnectContext(sliceSelector=_=>_, mapSliceToProps=_=>({}), mapDispatchToProps) {
  return function wrapComponent(ReactComponent) {
    function Context(props, context) {

      const nextSliceSelector = (context && context.sliceSelector) ?
        state => sliceSelector(context.sliceSelector(state)):
        state => sliceSelector(state);

      const mapStateToProps = state => {
        const slice = nextSliceSelector(state);
        // console.log('slice', slice);
        const mapping = mapSliceToProps(slice);
        // console.log('mapping', mapping);
        return mapping;
      };

      const Connect = connect(mapStateToProps, mapDispatchToProps)(ReactComponent);

      Connect.childContextTypes = Connect.contextTypes = {
        store: object,
        storeSubscription: object,
        sliceSelector: func
      };

      Connect.prototype.getChildContext = function() {
        return { ...context, sliceSelector: nextSliceSelector };
      };

      return new Connect(props, context);
    }

    Context.childContextTypes = Context.contextTypes = {
      store: object,
      storeSubscription: object,
      sliceSelector: func
    };

    Context.displayName = 'Context(' + ReactComponent.name + ')';

    return Context;
  };

}


/**
 * @param {Function} mapSliceToProps
 * @param {Function} [mapDispatchToProps]
 * @returns {connectToContextFactory}
 */
export function connectToContext (mapSliceToProps, mapDispatchToProps) {
  return function connectToContextFactory(ReactComponent) {
    return function wrapComponentWithContext(sliceSelector) {
      const connected = makeConnectContext(sliceSelector, mapSliceToProps, mapDispatchToProps);
      const Connect = connected(ReactComponent);

      return Connect;
    }
  }
}

/**
 * @param {Function<ctx>} sliceSelector (state => state.subProperty)
 * @returns {contextFactory}
 */
export function context (sliceSelector) {
  if(!sliceSelector) {
    console.error('Missing required parameter for binding context(): sliceSelector {Function<ctx>}');
    return;
  }

  return function contextFactory(wrapComponentWithContext) {
    return wrapComponentWithContext(sliceSelector);
  }
}