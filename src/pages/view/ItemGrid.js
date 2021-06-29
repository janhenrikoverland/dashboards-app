import React, { useState, useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import cx from 'classnames'
import { Responsive as ResponsiveReactGridLayout } from 'react-grid-layout'

import { useWindowDimensions } from '../../components/WindowDimensionsProvider'
import { Item } from '../../components/Item/Item'
import {
    GRID_ROW_HEIGHT_PX,
    SM_SCREEN_GRID_COLUMNS,
    GRID_COMPACT_TYPE,
    GRID_PADDING_PX,
    MARGIN_PX,
    MARGIN_SM_PX,
    GRID_COLUMNS,
    getSmallLayout,
    getGridWidth,
    getProportionalHeight,
} from '../../modules/gridUtil'
import NoContentMessage from '../../components/NoContentMessage'
import { sGetSelectedDashboardItems } from '../../reducers/selected'

import ProgressiveLoadingContainer from '../../components/ProgressiveLoadingContainer'
import { VIEW } from '../../modules/dashboardModes'
import { getVisualizationName } from '../../modules/item'
import { getBreakpoint, isSmallScreen } from '../../modules/smallScreen'
import { getGridItemDomElementClassName } from '../../modules/getGridItemDomElementClassName'

import classes from './styles/ItemGrid.module.css'

const EXPANDED_HEIGHT = 17
const EXPANDED_HEIGHT_SM = 13

const ResponsiveItemGrid = ({ isRecording, dashboardItems }) => {
    const { width } = useWindowDimensions()
    const [expandedItems, setExpandedItems] = useState({})
    const [displayItems, setDisplayItems] = useState(dashboardItems)
    const [layoutSm, setLayoutSm] = useState([])
    const [gridWidth, setGridWidth] = useState(0)

    useEffect(() => {
        setLayoutSm(
            getItemsWithAdjustedHeight(getSmallLayout(dashboardItems, width))
        )
        setDisplayItems(getItemsWithAdjustedHeight(dashboardItems))
    }, [expandedItems, width, dashboardItems])

    const onToggleItemExpanded = clickedId => {
        const isExpanded =
            typeof expandedItems[clickedId] === 'boolean'
                ? expandedItems[clickedId]
                : false

        const newExpandedItems = { ...expandedItems }
        newExpandedItems[clickedId] = !isExpanded
        setExpandedItems(newExpandedItems)
    }

    const getItemsWithAdjustedHeight = items =>
        items.map(item => {
            const expandedItem = expandedItems[item.id]

            if (expandedItem && expandedItem === true) {
                const expandedHeight = isSmallScreen(width)
                    ? EXPANDED_HEIGHT_SM
                    : EXPANDED_HEIGHT
                return Object.assign({}, item, {
                    h: item.h + expandedHeight,
                    smallOriginalH: getProportionalHeight(item, width),
                })
            }

            return item
        })

    const getItemComponent = item => {
        if (!layoutSm.length) {
            return <div key={item.i} />
        }

        return (
            <ProgressiveLoadingContainer
                key={item.i}
                className={cx(
                    item.type,
                    'view',
                    getGridItemDomElementClassName(item.id)
                )}
                name={getVisualizationName(item)}
                forceLoad={isRecording}
            >
                <Item
                    item={item}
                    gridWidth={gridWidth}
                    dashboardMode={VIEW}
                    onToggleItemExpanded={onToggleItemExpanded}
                    isRecording={isRecording}
                />
            </ProgressiveLoadingContainer>
        )
    }

    const getItemComponents = items => items.map(item => getItemComponent(item))

    const onWidthChanged = containerWidth =>
        setTimeout(() => setGridWidth(containerWidth), 200)

    if (!dashboardItems.length) {
        return (
            <NoContentMessage
                text={i18n.t('There are no items on this dashboard')}
            />
        )
    }

    return (
        <ResponsiveReactGridLayout
            className={classes.grid}
            rowHeight={GRID_ROW_HEIGHT_PX}
            width={getGridWidth(width)}
            cols={{ lg: GRID_COLUMNS, sm: SM_SCREEN_GRID_COLUMNS }}
            breakpoints={{
                lg: getBreakpoint(),
                sm: 0,
            }}
            layouts={{ lg: displayItems, sm: layoutSm }}
            compactType={GRID_COMPACT_TYPE}
            margin={isSmallScreen(width) ? MARGIN_SM_PX : MARGIN_PX}
            containerPadding={{
                lg: GRID_PADDING_PX,
                sm: GRID_PADDING_PX,
            }}
            isDraggable={false}
            isResizable={false}
            draggableCancel="input,textarea"
            onWidthChange={onWidthChanged}
        >
            {getItemComponents(displayItems)}
        </ResponsiveReactGridLayout>
    )
}

ResponsiveItemGrid.propTypes = {
    dashboardItems: PropTypes.array,
    isRecording: PropTypes.bool,
}

const mapStateToProps = state => ({
    dashboardItems: sGetSelectedDashboardItems(state),
})

export default connect(mapStateToProps)(ResponsiveItemGrid)
