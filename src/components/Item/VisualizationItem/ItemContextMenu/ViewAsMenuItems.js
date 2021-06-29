import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { IconVisualizationColumn16, IconTable16, IconWorld16 } from '@dhis2/ui'
import MenuItem from './MenuItemWithTooltip'

import getThematicMapViews from '../getThematicMapViews'
import {
    CHART,
    MAP,
    REPORT_TABLE,
    EVENT_CHART,
    EVENT_REPORT,
    isTrackerDomainType,
    hasMapView,
} from '../../../../modules/itemTypes'

const ViewAsMenuItems = ({
    type,
    activeType,
    visualization,
    onActiveTypeChanged,
}) => {
    const isTrackerType = isTrackerDomainType(type)

    const onViewTable = () =>
        onActiveTypeChanged(isTrackerType ? EVENT_REPORT : REPORT_TABLE)

    const onViewChart = () =>
        onActiveTypeChanged(isTrackerType ? EVENT_CHART : CHART)

    const onViewMap = () => onActiveTypeChanged(MAP)

    const notSupported = type === MAP && !getThematicMapViews(visualization)

    return (
        <>
            {activeType !== CHART && activeType !== EVENT_CHART && (
                <MenuItem
                    tooltip={
                        notSupported
                            ? i18n.t("This map can't be displayed as a chart")
                            : null
                    }
                    label={i18n.t('View as Chart')}
                    onClick={onViewChart}
                    icon={<IconVisualizationColumn16 />}
                />
            )}
            {activeType !== REPORT_TABLE && activeType !== EVENT_REPORT && (
                <MenuItem
                    tooltip={
                        notSupported
                            ? i18n.t("This map can't be displayed as a table")
                            : null
                    }
                    label={i18n.t('View as Table')}
                    onClick={onViewTable}
                    icon={<IconTable16 />}
                />
            )}
            {hasMapView(type) && activeType !== MAP && (
                <MenuItem
                    label={i18n.t('View as Map')}
                    onClick={onViewMap}
                    icon={<IconWorld16 />}
                />
            )}
        </>
    )
}

ViewAsMenuItems.propTypes = {
    activeType: PropTypes.string,
    type: PropTypes.string,
    visualization: PropTypes.object,
    onActiveTypeChanged: PropTypes.func,
}

export default ViewAsMenuItems
