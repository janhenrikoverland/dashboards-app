import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import i18n from '@dhis2/d2-i18n'
import isEmpty from 'lodash/isEmpty'
// import { CacheableSection } from '@dhis2/app-service-offline'

import DashboardsBar from './DashboardsBar/DashboardsBar'
// import ViewDashboard from './ViewDashboard'
import NoContentMessage from '../../components/NoContentMessage'
import LoadingMask from '../../components/LoadingMask'
import {
    sDashboardsIsFetching,
    sGetDashboardById,
    sGetDashboardsSortedByStarred,
} from '../../reducers/dashboards'
import { getPreferredDashboardId } from '../../modules/localStorage'

const CacheableViewDashboard = ({
    id,
    dashboardsLoaded,
    dashboardsIsEmpty,
    username,
}) => {
    if (!dashboardsLoaded) {
        return <LoadingMask />
    }

    if (dashboardsIsEmpty) {
        return (
            <>
                <DashboardsBar />
                <NoContentMessage
                    text={i18n.t(
                        'No dashboards found. Use the + button to create a new dashboard.'
                    )}
                />
            </>
        )
    }

    if (id === null) {
        return (
            <>
                <DashboardsBar />
                <NoContentMessage
                    text={i18n.t('Requested dashboard not found')}
                />
            </>
        )
    }

    return (
        // <CacheableSection sectionId={id} loadingMask={<LoadingMask />}>
        <ViewDashboard id={id} username={username} />
        // <div>Hey Jen2</div>
        // </CacheableSection>
    )
}

CacheableViewDashboard.propTypes = {
    dashboardsIsEmpty: PropTypes.bool,
    dashboardsLoaded: PropTypes.bool,
    id: PropTypes.string,
    username: PropTypes.string,
}

const mapStateToProps = (state, ownProps) => {
    const dashboards = sGetDashboardsSortedByStarred(state)
    // match is provided by the react-router-dom
    const routeId = ownProps.match?.params?.dashboardId || null

    let dashboardToSelect = null
    if (routeId) {
        dashboardToSelect = sGetDashboardById(state, routeId) || null
    } else {
        const lastStoredDashboardId = getPreferredDashboardId(ownProps.username)
        const dash = sGetDashboardById(state, lastStoredDashboardId)
        dashboardToSelect = lastStoredDashboardId && dash ? dash : dashboards[0]
    }

    return {
        dashboardsIsEmpty: isEmpty(dashboards),
        dashboardsLoaded: !sDashboardsIsFetching(state),
        id: dashboardToSelect?.id || null,
    }
}

export default connect(mapStateToProps, null)(CacheableViewDashboard)
