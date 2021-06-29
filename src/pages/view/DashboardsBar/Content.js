import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import { Redirect, withRouter } from 'react-router-dom'
import { Button, Tooltip, ComponentCover, IconAdd24 } from '@dhis2/ui'
import { useOnlineStatus } from '@dhis2/app-service-offline'

import Chip from './Chip'
import Filter from './Filter'
import { getFilteredDashboards } from './getFilteredDashboards'

import { sGetAllDashboards } from '../../../reducers/dashboards'
import { sGetDashboardsFilter } from '../../../reducers/dashboardsFilter'
import { sGetSelectedId } from '../../../reducers/selected'

import classes from './styles/Content.module.css'

const Content = ({
    dashboards,
    expanded,
    filterText,
    history,
    selectedId,
    onChipClicked,
    onSearchClicked,
}) => {
    const [redirectUrl, setRedirectUrl] = useState(null)
    const { isOnline } = useOnlineStatus()

    const onSelectDashboard = () => {
        const id = getFilteredDashboards(dashboards, filterText)[0]?.id
        if (id) {
            history.push(id)
        }
    }

    const enterNewMode = () => {
        if (isOnline) {
            setRedirectUrl('/new')
        }
    }

    const getChips = () =>
        getFilteredDashboards(dashboards, filterText).map(dashboard => (
            <Chip
                key={dashboard.id}
                label={dashboard.displayName}
                starred={dashboard.starred}
                dashboardId={dashboard.id}
                selected={dashboard.id === selectedId}
                onClick={onChipClicked}
            />
        ))

    const getControlsSmall = () => (
        <div className={classes.controlsSmall}>
            <Filter
                onKeypressEnter={onSelectDashboard}
                onSearchClicked={onSearchClicked}
                expanded={expanded}
            />
        </div>
    )

    const getControlsLarge = () => (
        <span className={classes.controlsLarge}>
            <Tooltip
                content={
                    isOnline
                        ? i18n.t('Create new dashboard')
                        : i18n.t('Cannot create a dashboard while offline')
                }
                closeDelay={100}
                openDelay={400}
            >
                <Button
                    className={classes.newButton}
                    disabled={!isOnline}
                    small
                    icon={<IconAdd24 />}
                    onClick={enterNewMode}
                    dataTest="new-button"
                />
                {!isOnline && <ComponentCover />}
            </Tooltip>
            <Filter
                onKeypressEnter={onSelectDashboard}
                onSearchClicked={onSearchClicked}
                expanded={expanded}
            />
        </span>
    )

    if (redirectUrl) {
        return <Redirect to={redirectUrl} />
    }

    return (
        <div
            className={cx(
                classes.container,
                expanded ? classes.expanded : classes.collapsed
            )}
        >
            {getControlsSmall()}
            <div className={classes.chipsContainer}>
                {getControlsLarge()}
                {getChips()}
            </div>
        </div>
    )
}

Content.propTypes = {
    dashboards: PropTypes.object,
    expanded: PropTypes.bool,
    filterText: PropTypes.string,
    history: PropTypes.object,
    selectedId: PropTypes.string,
    onChipClicked: PropTypes.func,
    onSearchClicked: PropTypes.func,
}

const mapStateToProps = state => ({
    dashboards: sGetAllDashboards(state),
    selectedId: sGetSelectedId(state),
    filterText: sGetDashboardsFilter(state),
})

export default withRouter(connect(mapStateToProps)(Content))
