import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import ReactGridLayout from 'react-grid-layout'
import i18n from '@dhis2/d2-i18n'
import { Layer, CenteredContent, CircularLoader } from '@dhis2/ui'

import NoContentMessage from '../../widgets/NoContentMessage'
import {
    GRID_ROW_HEIGHT_PX,
    GRID_COMPACT_TYPE,
    MARGIN_PX,
    GRID_COLUMNS,
} from '../../modules/gridUtil'

import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import './styles/ItemGrid.css'

const PAGE_PADDING_PX = 24

const StaticGrid = ({
    layout,
    children,
    onLayoutChange,
    className,
    isLoading,
}) => {
    if (!isLoading && !layout.length) {
        return (
            <NoContentMessage
                text={i18n.t('There are no items on this dashboard')}
            />
        )
    }

    const style = window.getComputedStyle(document.documentElement)
    const pageWidthPx = parseInt(
        style.getPropertyValue('--a4-landscape-width-px').replace('px', '')
    )

    return (
        <>
            {isLoading ? (
                <Layer translucent>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </Layer>
            ) : null}
            <ReactGridLayout
                margin={MARGIN_PX}
                cols={GRID_COLUMNS}
                rowHeight={GRID_ROW_HEIGHT_PX}
                width={pageWidthPx - PAGE_PADDING_PX}
                compactType={GRID_COMPACT_TYPE}
                isDraggable={false}
                isResizable={false}
                draggableCancel="input,textarea"
                className={cx('layout', className)}
                layout={layout}
                onLayoutChange={onLayoutChange}
            >
                {children}
            </ReactGridLayout>
        </>
    )
}

StaticGrid.defaultProps = {
    onLayoutChange: Function.prototype,
}

StaticGrid.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    isLoading: PropTypes.bool,
    layout: PropTypes.array,
    onLayoutChange: PropTypes.func,
}

export default StaticGrid
