import { string } from 'prop-types';
import { connect } from 'react-redux';

const noop = _=>_;

/**
 * Proxies react-redux connect() in order to access store and mount reducer subtrees on the fly
 * @param {Function} reducer
 * @returns {Function}
 */
export function connectSlice(reducer) {
  if(typeof reducer !== 'function') {
    console.error('Common store: required argument "reducer" was omitted');
    return;
  }

  return function(mapSliceToProps=noop, mapDispatchToProps, mergeProps, options) {

    function getContext(keyPath, state) {
      return state && state[keyPath] ? state[keyPath]: {};
    }

    const connectArgs = [
      // mapStateToProps
      (state, ownProps) => {
        return mapSliceToProps(getContext(ownProps.sliceKey, state), state, ownProps);
      },

      // mapDispatchToProps,
      (dispatch, ownProps) => {
        return mapDispatchToProps? mapDispatchToProps(ownProps.sliceKey, dispatch, ownProps) : {};
      },

      // mergeProps,
      //options
    ];

    const container = connect(...connectArgs);
    return function(ReactComponent) {
      const Connect = container(ReactComponent);

      class ConnectSlice extends Connect {
        constructor(props, context) {
          super(props, context);

          const keyPath = props.sliceKey;
          if(this.store.reducerMap.hasOwnProperty(keyPath)) {
            const name = Connect.displayName;
            console.error(`${name} sliceKey conflict! '${keyPath}' is already in use.`);
          }
          else {
            this.store.mount(keyPath, reducer);
          }
        }
      }

      ConnectSlice.propTypes = {
        sliceKey: string.isRequired
      };

      return ConnectSlice;
    }
  }
}
