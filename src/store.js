import { createStore, compose } from 'redux';
import { createReducerTree } from './reducer';


const init = (state, action) => state;

function mount(store, keyPath, reducer) {
  store.reducerMap[keyPath] = reducer;
  store.replaceReducer(createReducerTree(store.reducerMap, init));
}

export function configureStore(initialState) {
  // For devtools debug, because this is very much in development
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const store = createStore(
    init,
    initialState,
    composeEnhancers(
      /* applyMiddleware(...middleware) */
    )
  );

  store.reducerMap = {};
  store.mount = mount.bind(null, store);
  return store;
}