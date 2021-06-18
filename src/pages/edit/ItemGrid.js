import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { Responsive as ResponsiveReactGridLayout } from 'react-grid-layout'
import cx from 'classnames'

import { acUpdateDashboardLayout } from '../../actions/editDashboard'
import { Item } from '../../components/Item/Item'
import {
    GRID_ROW_HEIGHT_PX,
    GRID_COMPACT_TYPE,
    MARGIN_PX,
    GRID_PADDING_PX,
    GRID_COLUMNS,
    hasShape,
    getGridWidth,
} from '../../modules/gridUtil'
import { getBreakpoint } from '../../modules/smallScreen'
import { orArray } from '../../modules/util'
import { getGridItemDomElementClassName } from '../../modules/getGridItemDomElementClassName'
import NoContentMessage from '../../components/NoContentMessage'
import {
    sGetEditDashboardItems,
    sGetHideGrid,
} from '../../reducers/editDashboard'
import ProgressiveLoadingContainer from '../../components/ProgressiveLoadingContainer'
import { EDIT } from '../../modules/dashboardModes'
import { useWindowDimensions } from '../../components/WindowDimensionsProvider'

import classes from './styles/ItemGrid.module.css'

const EditItemGrid = ({
    dashboardItems,
    acUpdateDashboardLayout,
    hideGrid,
}) => {
    const [gridWidth, setGridWidth] = useState({ width: 0 })
    const { width } = useWindowDimensions()

    const onLayoutChange = newLayout => {
        acUpdateDashboardLayout(newLayout)
    }

    const onWidthChanged = containerWidth =>
        setTimeout(() => setGridWidth({ width: containerWidth }), 200)

    const getItemComponent = item => (
        <ProgressiveLoadingContainer
            key={item.i}
            className={cx(
                item.type,
                'edit',
                getGridItemDomElementClassName(item.id)
            )}
            itemId={item.id}
        >
            <Item
                item={item}
                gridWidth={gridWidth.width}
                dashboardMode={EDIT}
            />
        </ProgressiveLoadingContainer>
    )

    const getItemComponents = items => items.map(item => getItemComponent(item))

    if (!dashboardItems.length) {
        return (
            <NoContentMessage
                text={i18n.t('There are no items on this dashboard')}
            />
        )
    }

    if (hideGrid) {
        return null
    }

    return (
        <ResponsiveReactGridLayout
            className={classes.grid}
            rowHeight={GRID_ROW_HEIGHT_PX}
            width={getGridWidth(width)}
            cols={{ lg: GRID_COLUMNS }}
            breakpoints={{
                lg: getBreakpoint(),
            }}
            layouts={{ lg: dashboardItems }}
            compactType={GRID_COMPACT_TYPE}
            margin={MARGIN_PX}
            containerPadding={{ lg: GRID_PADDING_PX }}
            onLayoutChange={onLayoutChange}
            onWidthChange={onWidthChanged}
            isDraggable={true}
            isResizable={true}
            draggableCancel="input,textarea"
        >
            {getItemComponents(dashboardItems)}
        </ResponsiveReactGridLayout>
    )
}

EditItemGrid.propTypes = {
    acUpdateDashboardLayout: PropTypes.func,
    dashboardItems: PropTypes.array,
    hideGrid: PropTypes.bool,
}

// Container

const mapStateToProps = state => {
    return {
        dashboardItems: orArray(sGetEditDashboardItems(state)).filter(hasShape),
        hideGrid: sGetHideGrid(state),
    }
}

const mapDispatchToProps = {
    acUpdateDashboardLayout,
}

export default connect(mapStateToProps, mapDispatchToProps)(EditItemGrid)
