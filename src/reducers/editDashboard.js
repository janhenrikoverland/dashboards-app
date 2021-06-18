/** @module reducers/editDashboard */
import update from 'immutability-helper'
import isEmpty from 'lodash/isEmpty'
import { orArray, orObject } from '../modules/util'

export const RECEIVED_EDIT_DASHBOARD = 'RECEIVED_EDIT_DASHBOARD'
export const RECEIVED_NOT_EDITING = 'RECEIVED_NOT_EDITING'
export const START_NEW_DASHBOARD = 'START_NEW_DASHBOARD'
export const RECEIVED_TITLE = 'RECEIVED_TITLE'
export const RECEIVED_DESCRIPTION = 'RECEIVED_DESCRIPTION'
export const ADD_DASHBOARD_ITEM = 'ADD_DASHBOARD_ITEM'
export const REMOVE_DASHBOARD_ITEM = 'REMOVE_DASHBOARD_ITEM'
export const UPDATE_DASHBOARD_ITEM = 'UPDATE_DASHBOARD_ITEM'
export const RECEIVED_DASHBOARD_LAYOUT = 'RECEIVED_DASHBOARD_LAYOUT'
export const SET_PRINT_PREVIEW_VIEW = 'SET_PRINT_PREVIEW_VIEW'
export const CLEAR_PRINT_PREVIEW_VIEW = 'CLEAR_PRINT_PREVIEW_VIEW'
export const RECEIVED_FILTER_SETTINGS = 'RECEIVED_FILTER_SETTINGS'
export const RECEIVED_HIDE_GRID = 'RECEIVED_HIDE_GRID'

export const DEFAULT_STATE_EDIT_DASHBOARD = {}
export const NEW_DASHBOARD_STATE = {
    id: '',
    name: '',
    access: { update: true, delete: true },
    allowedFilters: [],
    description: '',
    dashboardItems: [],
    restrictFilters: false,
    printPreviewView: false,
    isDirty: false,
    href: '',
    hideGrid: false,
}

export default (state = DEFAULT_STATE_EDIT_DASHBOARD, action) => {
    switch (action.type) {
        case RECEIVED_EDIT_DASHBOARD: {
            const newState = {}
            Object.keys(NEW_DASHBOARD_STATE).map(
                k => (newState[k] = action.value[k])
            )
            newState.printPreviewView = false
            newState.isDirty = false
            return newState
        }
        case RECEIVED_NOT_EDITING:
            return DEFAULT_STATE_EDIT_DASHBOARD
        case SET_PRINT_PREVIEW_VIEW:
            return Object.assign({}, state, { printPreviewView: true })
        case CLEAR_PRINT_PREVIEW_VIEW:
            return Object.assign({}, state, { printPreviewView: false })
        case START_NEW_DASHBOARD:
            return NEW_DASHBOARD_STATE
        case RECEIVED_TITLE: {
            return Object.assign({}, state, {
                name: action.value,
                isDirty: true,
            })
        }
        case RECEIVED_DESCRIPTION: {
            return Object.assign({}, state, {
                description: action.value,
                isDirty: true,
            })
        }
        case ADD_DASHBOARD_ITEM:
            if (!action.value.position) {
                return update(state, {
                    dashboardItems: { $unshift: [action.value] },
                    isDirty: { $set: true },
                })
            }

            return update(state, {
                dashboardItems: {
                    $splice: [
                        [parseInt(action.value.position), 0, action.value],
                    ],
                },
                isDirty: { $set: true },
            })

        case REMOVE_DASHBOARD_ITEM: {
            const idToRemove = action.value

            const dashboardItemIndex = state.dashboardItems.findIndex(
                item => item.id === idToRemove
            )

            if (dashboardItemIndex > -1) {
                return update(state, {
                    dashboardItems: {
                        $splice: [[dashboardItemIndex, 1]],
                    },
                    isDirty: { $set: true },
                })
            }

            return state
        }
        case RECEIVED_DASHBOARD_LAYOUT: {
            const stateItems = orArray(state.dashboardItems)
            let layoutHasChanged = false

            const newStateItems = action.value.map(({ x, y, w, h, i }) => {
                const stateItem = stateItems.find(si => si.id === i)

                if (
                    !(
                        stateItem.x === x &&
                        stateItem.y === y &&
                        stateItem.w === w &&
                        stateItem.h === h
                    )
                ) {
                    layoutHasChanged = true
                    return Object.assign({}, stateItem, { w, h, x, y })
                }

                return stateItem
            })

            return layoutHasChanged
                ? {
                      ...state,
                      dashboardItems: newStateItems,
                      isDirty: true,
                  }
                : state
        }
        case UPDATE_DASHBOARD_ITEM: {
            const dashboardItem = action.value

            const dashboardItemIndex = state.dashboardItems.findIndex(
                item => item.id === dashboardItem.id
            )

            if (dashboardItemIndex > -1) {
                const newState = update(state, {
                    dashboardItems: {
                        $splice: [
                            [
                                dashboardItemIndex,
                                1,
                                Object.assign({}, dashboardItem),
                            ],
                        ],
                    },
                    isDirty: { $set: true },
                })

                return newState
            }

            return state
        }
        case RECEIVED_FILTER_SETTINGS: {
            return Object.assign({}, state, {
                allowedFilters: action.value.allowedFilters,
                restrictFilters: action.value.restrictFilters,
                isDirty: true,
            })
        }
        case RECEIVED_HIDE_GRID: {
            return {
                ...state,
                hideGrid: action.value,
            }
        }
        default:
            return state
    }
}

// root selector

export const sGetEditDashboardRoot = state => state.editDashboard

// selectors

export const sGetIsEditing = state => !isEmpty(state.editDashboard)

export const sGetIsPrintPreviewView = state =>
    sGetEditDashboardRoot(state).printPreviewView

export const sGetEditDashboardName = state => sGetEditDashboardRoot(state).name
export const sGetEditDashboardDescription = state =>
    sGetEditDashboardRoot(state).description

export const sGetEditDashboardItems = state =>
    orObject(sGetEditDashboardRoot(state)).dashboardItems

export const sGetEditIsDirty = state => sGetEditDashboardRoot(state).isDirty

export const sGetHideGrid = state => sGetEditDashboardRoot(state).hideGrid
