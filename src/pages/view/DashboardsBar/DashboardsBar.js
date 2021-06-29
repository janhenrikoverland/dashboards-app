import React, { useState, useRef, useEffect, createRef } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import PropTypes from 'prop-types'
import { Button } from '@dhis2/ui'
import { useOnlineStatus } from '@dhis2/app-service-offline'

import Content from './Content'
import ShowMoreButton from './ShowMoreButton'
import DragHandle from './DragHandle'
import { getRowsFromHeight } from './getRowsFromHeight'
import { sGetControlBarUserRows } from '../../../reducers/controlBar'
import { acSetControlBarUserRows } from '../../../actions/controlBar'
import { apiPostControlBarRows } from '../../../api/controlBar'
import { useWindowDimensions } from '../../../components/WindowDimensionsProvider'

import classes from './styles/DashboardsBar.module.css'

export const MIN_ROW_COUNT = 1
export const MAX_ROW_COUNT = 10

const DashboardsBar = ({
    userRows,
    updateUserRows,
    expanded,
    onExpandedChanged,
}) => {
    const [dragging, setDragging] = useState(false)
    const [mouseYPos, setMouseYPos] = useState(0)
    const userRowsChanged = useRef(false)
    const ref = createRef()
    const { height } = useWindowDimensions()
    const { isOnline, goOnline, goOffline } = useOnlineStatus()

    const rootElement = document.documentElement

    useEffect(() => {
        if (mouseYPos === 0) {
            return
        }

        const newRows = Math.max(
            MIN_ROW_COUNT,
            getRowsFromHeight(mouseYPos - 52) // don't rush the transition to a bigger row count
        )

        if (newRows < MAX_ROW_COUNT) {
            onExpandedChanged(false)
        }

        if (newRows !== userRows) {
            updateUserRows(Math.min(newRows, MAX_ROW_COUNT))
            userRowsChanged.current = true
        }
    }, [mouseYPos])

    useEffect(() => {
        rootElement.style.setProperty('--user-rows-count', userRows)
    }, [userRows])

    useEffect(() => {
        const vh = height * 0.01
        rootElement.style.setProperty('--vh', `${vh}px`)
    }, [height])

    useEffect(() => {
        if (!dragging && userRowsChanged.current) {
            apiPostControlBarRows(userRows)
            userRowsChanged.current = false
        }
    }, [dragging, userRowsChanged.current])

    const scrollToTop = () => {
        if (expanded) {
            ref.current.scroll(0, 0)
        }
    }

    const toggleExpanded = () => {
        if (expanded) {
            cancelExpanded()
        } else {
            scrollToTop()
            onExpandedChanged(!expanded)
        }
    }

    const cancelExpanded = () => {
        scrollToTop()
        onExpandedChanged(false)
    }

    return (
        <div
            className={expanded ? classes.expanded : classes.collapsed}
            style={{ position: 'relative' }}
            data-test="dashboards-bar"
        >
            <div className={cx(classes.container)}>
                <div className={classes.content} ref={ref}>
                    <Content
                        onChipClicked={cancelExpanded}
                        onSearchClicked={toggleExpanded}
                        expanded={expanded}
                    />
                </div>
                <ShowMoreButton
                    onClick={toggleExpanded}
                    dashboardBarIsExpanded={expanded}
                    disabled={!expanded && userRows === MAX_ROW_COUNT}
                />
                <DragHandle
                    setDragging={setDragging}
                    onHeightChanged={setMouseYPos}
                />
            </div>
            <div className={cx(classes.spacer)} />
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    zIndex: '3000',
                }}
            >
                <Button
                    className={isOnline ? classes.online : classes.offline}
                    dense
                    small
                    onClick={goOffline}
                    dataTest={'go-offline'}
                >
                    Go off
                </Button>
                <Button
                    className={isOnline ? classes.online : classes.offline}
                    dense
                    small
                    onClick={goOnline}
                    dataTest={'go-online'}
                >
                    Go on
                </Button>
            </div>
        </div>
    )
}

DashboardsBar.propTypes = {
    expanded: PropTypes.bool,
    updateUserRows: PropTypes.func,
    userRows: PropTypes.number,
    onExpandedChanged: PropTypes.func,
}

DashboardsBar.defaultProps = {
    expanded: false,
    onExpandedChanged: Function.prototype,
}

const mapStateToProps = state => ({
    userRows: sGetControlBarUserRows(state),
})

const mapDispatchToProps = {
    updateUserRows: acSetControlBarUserRows,
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardsBar)
