import { generateUid } from 'd2/uid'
import i18n from '@dhis2/d2-i18n'

import {
    RECEIVED_EDIT_DASHBOARD,
    START_NEW_DASHBOARD,
    RECEIVED_NOT_EDITING,
    RECEIVED_TITLE,
    RECEIVED_DESCRIPTION,
    RECEIVED_DASHBOARD_LAYOUT,
    ADD_DASHBOARD_ITEM,
    UPDATE_DASHBOARD_ITEM,
    REMOVE_DASHBOARD_ITEM,
    SET_PRINT_PREVIEW_VIEW,
    CLEAR_PRINT_PREVIEW_VIEW,
    RECEIVED_FILTER_SETTINGS,
    sGetEditDashboardRoot,
    RECEIVED_HIDE_GRID,
} from '../reducers/editDashboard'
import { tFetchDashboards } from './dashboards'
import { updateDashboard, postDashboard } from '../api/editDashboard'
import {
    NEW_ITEM_SHAPE,
    getGridItemProperties,
    getPageBreakItemShape,
    getPrintTitlePageItemShape,
} from '../modules/gridUtil'
import { itemTypeMap, PAGEBREAK, PRINT_TITLE_PAGE } from '../modules/itemTypes'
import { convertUiItemsToBackend } from '../modules/uiBackendItemConverter'

// actions

export const acSetEditDashboard = dashboard => ({
    type: RECEIVED_EDIT_DASHBOARD,
    value: dashboard,
})

export const acSetEditNewDashboard = () => ({
    type: START_NEW_DASHBOARD,
})

export const acClearEditDashboard = () => ({
    type: RECEIVED_NOT_EDITING,
})

export const acSetPrintPreviewView = () => ({
    type: SET_PRINT_PREVIEW_VIEW,
})

export const acClearPrintPreviewView = () => ({
    type: CLEAR_PRINT_PREVIEW_VIEW,
})

export const acSetDashboardTitle = value => ({
    type: RECEIVED_TITLE,
    value,
})

export const acSetDashboardDescription = value => ({
    type: RECEIVED_DESCRIPTION,
    value,
})

export const acUpdateDashboardLayout = value => ({
    type: RECEIVED_DASHBOARD_LAYOUT,
    value,
})

export const acAddDashboardItem = item => {
    const type = item.type
    delete item.type
    const itemPropName = itemTypeMap[type].propName

    const id = generateUid()
    const gridItemProperties = getGridItemProperties(id)

    let shape
    if (type === PAGEBREAK) {
        const yPos = item.yPos || 0
        shape = getPageBreakItemShape(yPos, item.isStatic)
    } else if (type === PRINT_TITLE_PAGE) {
        shape = getPrintTitlePageItemShape()
    } else {
        shape = NEW_ITEM_SHAPE
    }

    return {
        type: ADD_DASHBOARD_ITEM,
        value: {
            id,
            type,
            position: item.position || null,
            [itemPropName]: item.content,
            ...NEW_ITEM_SHAPE,
            ...gridItemProperties,
            ...shape,
        },
    }
}

export const acUpdateDashboardItem = item => ({
    type: UPDATE_DASHBOARD_ITEM,
    value: item,
})

export const acRemoveDashboardItem = value => ({
    type: REMOVE_DASHBOARD_ITEM,
    value,
})

export const acSetFilterSettings = value => ({
    type: RECEIVED_FILTER_SETTINGS,
    value,
})

export const acSetHideGrid = value => ({
    type: RECEIVED_HIDE_GRID,
    value,
})

// thunks

export const tSaveDashboard = () => async (dispatch, getState, dataEngine) => {
    const dashboard = sGetEditDashboardRoot(getState())

    const dashboardToSave = {
        ...dashboard,
        dashboardItems: convertUiItemsToBackend(dashboard.dashboardItems),
        name: dashboard.name || i18n.t('Untitled dashboard'),
    }

    const dashboardId = dashboardToSave.id
        ? await updateDashboard(dataEngine, dashboardToSave)
        : await postDashboard(dataEngine, dashboardToSave)

    // update the dashboard list
    await dispatch(tFetchDashboards())

    return Promise.resolve(dashboardId)
}
