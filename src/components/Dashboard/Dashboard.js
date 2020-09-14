import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import isEmpty from 'lodash/isEmpty'
import i18n from '@dhis2/d2-i18n'
import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui'
import debounce from 'lodash/debounce'

import DashboardsBar from '../ControlBar/DashboardsBar'
import DashboardVerticalOffset from './DashboardVerticalOffset'
import NoContentMessage from '../../widgets/NoContentMessage'
import ViewDashboard from './ViewDashboard'
import EditDashboard from './EditDashboard'
import NewDashboard from './NewDashboard'
import PrintDashboard from './PrintDashboard'
import PrintLayoutDashboard from './PrintLayoutDashboard'

import { tSelectDashboard } from '../../actions/dashboards'
import { acSetWindowHeight } from '../../actions/windowHeight'
import {
    sDashboardsIsFetching,
    sGetAllDashboards,
} from '../../reducers/dashboards'
import {
    sGetSelectedId,
    NON_EXISTING_DASHBOARD_ID,
} from '../../reducers/selected'
import {
    EDIT,
    NEW,
    VIEW,
    PRINT,
    PRINT_LAYOUT,
    isPrintMode,
} from './dashboardModes'

const setHeaderbarVisibility = mode => {
    const header = document.getElementsByTagName('header')[0]
    if (isPrintMode(mode)) {
        header.classList.add('hidden')
    } else {
        header.classList.remove('hidden')
    }
}

const dashboardMap = {
    [VIEW]: <ViewDashboard />,
    [EDIT]: <EditDashboard />,
    [NEW]: <NewDashboard />,
    [PRINT]: <PrintDashboard />,
    [PRINT_LAYOUT]: <PrintLayoutDashboard />,
}

export const Dashboard = ({
    id,
    mode,
    dashboardsLoaded,
    dashboardsIsEmpty,
    routeId,
    selectDashboard,
    setWindowHeight,
}) => {
    useEffect(() => {
        setHeaderbarVisibility(mode)
    }, [mode])

    useEffect(() => {
        if (dashboardsLoaded && !dashboardsIsEmpty) {
            selectDashboard(routeId)
        }
    }, [dashboardsLoaded, dashboardsIsEmpty, routeId, mode])

    useEffect(() => {
        // TODO does this need to be cleared?
        window.onresize = debounce(
            () => setWindowHeight(window.innerHeight),
            300
        )
    }, [])

    if (!dashboardsLoaded || id === null) {
        return (
            <Layer translucent>
                <CenteredContent>
                    <CircularLoader />
                </CenteredContent>
            </Layer>
        )
    }

    if (mode === NEW) {
        return dashboardMap[mode]
    }

    if (dashboardsIsEmpty) {
        return (
            <>
                <DashboardsBar />
                <DashboardVerticalOffset />
                <NoContentMessage
                    text={i18n.t(
                        'No dashboards found. Use the + button to create a new dashboard.'
                    )}
                />
            </>
        )
    }

    if (id === NON_EXISTING_DASHBOARD_ID) {
        return (
            <>
                <DashboardsBar />
                <DashboardVerticalOffset />
                <NoContentMessage
                    text={i18n.t('Requested dashboard not found')}
                />
            </>
        )
    }

    return dashboardMap[mode]
}

Dashboard.propTypes = {
    dashboardsIsEmpty: PropTypes.bool,
    dashboardsLoaded: PropTypes.bool,
    id: PropTypes.string,
    mode: PropTypes.string,
    routeId: PropTypes.string,
    selectDashboard: PropTypes.func,
    setWindowHeight: PropTypes.func,
}

const mapStateToProps = (state, ownProps) => {
    const dashboards = sGetAllDashboards(state)
    return {
        dashboardsIsEmpty: isEmpty(dashboards),
        dashboardsLoaded: !sDashboardsIsFetching(state),
        id: sGetSelectedId(state),
        routeId: ownProps.match.params.dashboardId || null,
    }
}

export default connect(mapStateToProps, {
    selectDashboard: tSelectDashboard,
    setWindowHeight: acSetWindowHeight,
})(Dashboard)
