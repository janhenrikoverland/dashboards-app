/** @module reducers/controlBar */
import { combineReducers } from 'redux';
import { validateReducer } from '../util';

export const actionTypes = {
    SET_CONTROLBAR_ROWS: 'SET_CONTROLBAR_ROWS',
    SET_CONTROLBAR_USER_ROWS: 'SET_CONTROLBAR_USER_ROWS',
};

export const DEFAULT_ROWS = 1;

const rows = (state = DEFAULT_ROWS, action) => {
    switch (action.type) {
        case actionTypes.SET_CONTROLBAR_ROWS:
            console.log('reducer', state, action);
            return validateReducer(action.value, DEFAULT_ROWS);
        default:
            return state;
    }
};

const userRows = (state = DEFAULT_ROWS, action) => {
    switch (action.type) {
        case actionTypes.SET_CONTROLBAR_USER_ROWS:
            console.log('reducer 2', state, action);
            return validateReducer(action.value, DEFAULT_ROWS);
        default:
            return state;
    }
};

export default combineReducers({
    rows,
    userRows,
});

/**
 * Selectors that point to specific props in the state object
 * @function
 * @param {Object} state
 * @returns {Object}
 */
export const sGetFromState = state => state.controlBar;

// Selector dependency level 2

export const sGetControlBarRows = state => sGetFromState(state).rows;
