import {
    SET_SELECTED_ID,
    SET_SELECTED_ISLOADING,
    NON_EXISTING_DASHBOARD_ID,
    sGetSelectedId,
} from '../reducers/selected'

import { sGetSelectedDashboardId } from '../reducers/dashboards'

import { acSetDashboardItems, acAppendDashboards } from './dashboards'
import { acClearItemFilters } from './itemFilters'
import { tGetMessages } from '../components/Item/MessagesItem/actions'
import { acClearVisualizations } from './visualizations'
import { acClearItemActiveTypes } from './itemActiveTypes'
import { apiFetchDashboard } from '../api/fetchDashboard'
import {
    getPreferredDashboardId,
    storePreferredDashboardId,
} from '../modules/localStorage'
import { withShape } from '../modules/gridUtil'
import { getCustomDashboards } from '../modules/getCustomDashboards'

import { MESSAGES } from '../modules/itemTypes'

// actions

export const acSetSelectedId = value => ({
    type: SET_SELECTED_ID,
    value,
})

export const acSetSelectedIsLoading = value => ({
    type: SET_SELECTED_ISLOADING,
    value,
})

// thunks
export const tSetSelectedDashboardById = (requestedId, mode, username) => (
    dispatch,
    getState,
    dataEngine
) => {
    const id = sGetSelectedDashboardId(
        getState(),
        requestedId,
        getPreferredDashboardId(username)
    )

    if (!id) {
        return dispatch(acSetSelectedId(NON_EXISTING_DASHBOARD_ID))
    }

    return apiFetchDashboard(dataEngine, id, mode)
        .then(selected => {
            dispatch(acAppendDashboards(selected))

            const customDashboard = getCustomDashboards(selected)[0]

            dispatch(
                acSetDashboardItems(withShape(customDashboard.dashboardItems))
            )

            storePreferredDashboardId(username, id)

            if (id !== sGetSelectedId(getState())) {
                dispatch(acClearItemFilters())
                dispatch(acClearVisualizations())
                dispatch(acClearItemActiveTypes())
            }

            customDashboard.dashboardItems.some(
                item => item.type === MESSAGES
            ) && dispatch(tGetMessages(dataEngine))

            dispatch(acSetSelectedId(id))

            return selected
        })
        .catch(err => {
            console.error('Error: ', err)
            return err
        })
}
