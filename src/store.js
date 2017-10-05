import { createStore } from 'redux';
import { createReducerTree } from './reducer';


const init = (state, action) => state;

function mount(store, keyPath, reducer) {
  store.reducerMap[keyPath] = reducer;
  store.replaceReducer(createReducerTree(store.reducerMap, init));
}

export function configureStore(initialState) {
  const store = createStore(
    init,

    //initialState,

    // For devtools debug, because this is very much in development
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()

  );

  store.reducerMap = {};
  store.mount = mount.bind(store, store);
  return store;
}