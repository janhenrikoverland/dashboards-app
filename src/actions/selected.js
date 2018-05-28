import { actionTypes } from '../reducers';
import { apiFetchDashboard } from '../api/dashboards';
import { acSetDashboardItems, acAppendDashboards } from './dashboards';
import { withShape } from '../ItemGrid/gridUtil';
import { tGetMessages } from '../Item/MessagesItem/actions';
import { acReceivedSnackbarMessage, acCloseSnackbar } from './snackbar';
import { storePreferredDashboardId } from '../api/localStorage';
import { fromUser, fromSelected } from '../reducers';
import { loadingDashboardMsg } from '../SnackbarMessage';
import {
    REPORT_TABLE,
    CHART,
    MAP,
    EVENT_REPORT,
    EVENT_CHART,
    MESSAGES,
} from '../itemTypes';
import { extractFavorite } from '../Item/PluginItem/plugin';
import { getCustomDashboards } from '../reducers/dashboards';

// actions

export const acSetSelectedId = value => ({
    type: actionTypes.SET_SELECTED_ID,
    value,
});

export const acSetSelectedIsLoading = value => ({
    type: actionTypes.SET_SELECTED_ISLOADING,
    value,
});

export const acSetSelectedShowDescription = value => ({
    type: actionTypes.SET_SELECTED_SHOWDESCRIPTION,
    value,
});

export const acNewDashboard = () => ({
    type: actionTypes.NEW_DASHBOARD,
});

export const acReceivedVisualization = value => ({
    type: actionTypes.RECEIVED_VISUALIZATION,
    value,
});

export const acReceivedActiveVisualization = (id, type, activeType) => {
    const action = {
        type: actionTypes.RECEIVED_ACTIVE_VISUALIZATION,
        id,
    };

    if (activeType !== type) {
        action.activeType = activeType;
    }

    return action;
};

export const tLoadDashboard = id => async (dispatch, getState) => {
    try {
        const dash = await apiFetchDashboard(id);
        dispatch(acAppendDashboards(dash));

        return Promise.resolve(dash);
    } catch (err) {
        console.log('Error: ', err);
        return err;
    }
};

// thunks
export const tSetSelectedDashboardById = (id, name = '') => async (
    dispatch,
    getState
) => {
    dispatch(acSetSelectedIsLoading(true));

    const snackbarTimeout = setTimeout(() => {
        if (fromSelected.sGetSelectedIsLoading(getState()) && name) {
            loadingDashboardMsg.name = name;

            dispatch(
                acReceivedSnackbarMessage({
                    message: loadingDashboardMsg,
                    open: true,
                })
            );
        }
    }, 500);

    const onSuccess = selected => {
        const customDashboard = getCustomDashboards(selected)[0];

        // set dashboard items
        dispatch(
            acSetDashboardItems(withShape(customDashboard.dashboardItems))
        );

        // store preferred dashboard
        storePreferredDashboardId(fromUser.sGetUsername(getState()), id);

        // add visualizations to store
        customDashboard.dashboardItems.forEach(item => {
            switch (item.type) {
                case REPORT_TABLE:
                case CHART:
                case MAP:
                case EVENT_REPORT:
                case EVENT_CHART:
                    dispatch(
                        acReceivedVisualization(
                            extractFavorite(item),
                            item.type
                        )
                    );
                    break;
                case MESSAGES:
                    dispatch(tGetMessages(id));
                    break;
                default:
                    break;
            }
        });

        // set selected dashboard
        dispatch(acSetSelectedId(id));

        // remove loading indicator
        dispatch(acSetSelectedIsLoading(false));

        clearTimeout(snackbarTimeout);

        dispatch(acCloseSnackbar());

        return selected;
    };

    const onError = error => {
        console.log('Error: ', error);
        return error;
    };

    try {
        const selected = await dispatch(tLoadDashboard(id));

        return onSuccess(selected);
    } catch (err) {
        return onError(err);
    }
};
