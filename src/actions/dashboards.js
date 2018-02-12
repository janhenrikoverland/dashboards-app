import { actionTypes } from '../reducers';
import {
    getCustomDashboards,
    sGetStarredDashboardIds,
    sGetById,
} from '../reducers/dashboards';
import { sGetUsername } from '../reducers/user';
import { tSetSelectedDashboardById } from './selected';
import { acClearEditDashboard } from './editDashboard';
import {
    apiFetchDashboards,
    apiStarDashboard,
    apiDeleteDashboard,
} from '../api/dashboards';
import {
    getPreferredDashboard,
    deletePreferredDashboard,
} from '../api/localStorage';
import { arrayToIdMap } from '../util';

// actions

export const acSetDashboards = (dashboards, append) => ({
    type: actionTypes.SET_DASHBOARDS,
    append: !!append,
    value: arrayToIdMap(getCustomDashboards(dashboards)),
});

export const acStarDashboard = (dashboardId, isStarred) => ({
    type: actionTypes.STAR_DASHBOARD,
    dashboardId: dashboardId,
    value: isStarred,
});

// thunks

export const tSetDashboards = () => async (dispatch, getState) => {
    const onSuccess = data => {
        const dashboards = data.toArray();
        dispatch(acSetDashboards(dashboards));
        const state = getState();

        const preferredDashboard = sGetById(
            getPreferredDashboard(sGetUsername(state))
        );

        const dashboardId = preferredDashboard
            ? preferredDashboard.id
            : sGetStarredDashboardIds(state)[0] || dashboards[0].id;

        dispatch(tSetSelectedDashboardById(dashboardId));

        return data;
    };

    const onError = error => {
        console.log('Error (apiFetchDashboards): ', error);
        return error;
    };

    try {
        const collection = await apiFetchDashboards();
        return onSuccess(collection);
    } catch (err) {
        return onError(err);
    }
};

export const tStarDashboard = (id, isStarred) => async (dispatch, getState) => {
    const onSuccess = id => {
        dispatch(acStarDashboard(id, isStarred));
        return id;
    };

    const onError = error => {
        console.log('Error (apiStarDashboard): ', error);
        return error;
    };
    try {
        await apiStarDashboard(id, isStarred);
        return onSuccess(id);
    } catch (err) {
        return onError(err);
    }
};

export const tDeleteDashboard = id => async (dispatch, getState) => {
    const onSuccess = () => {
        dispatch(acClearEditDashboard());

        return dispatch(tSetDashboards());
    };

    try {
        await apiDeleteDashboard(id);

        return onSuccess();
    } catch (err) {
        console.log('Error (deleteDashboard): ', err);
        return err;
    }
};
