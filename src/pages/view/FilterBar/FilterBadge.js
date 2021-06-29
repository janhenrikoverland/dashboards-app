import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { Tooltip } from '@dhis2/ui'
import {
    useOnlineStatus,
    useCacheableSection,
} from '@dhis2/app-service-offline'

import { acSetActiveModalDimension } from '../../../actions/activeModalDimension'
import { sGetSelectedId } from '../../../reducers/selected'

import classes from './styles/FilterBadge.module.css'

const FilterBadge = ({ dashboardId, filter, openFilterModal, onRemove }) => {
    const { isOnline } = useOnlineStatus()
    const { isCached } = useCacheableSection(dashboardId)

    const notAllowed = !isCached && !isOnline

    const filterText = `${filter.name}: ${
        filter.values.length > 1
            ? i18n.t('{{count}} selected', {
                  count: filter.values.length,
              })
            : filter.values[0].name
    }`

    return (
        <div className={classes.container} data-test="dashboard-filter-badge">
            <span
                className={classes.badge}
                onClick={() =>
                    openFilterModal({
                        id: filter.id,
                        name: filter.name,
                    })
                }
            >
                {filterText}
            </span>
            <span className={classes.badgeSmall}>{filterText}</span>
            <Tooltip
                content={i18n.t('Cannot remove filters while offline')}
                openDelay={200}
                closeDelay={100}
            >
                {({ onMouseOver, onMouseOut, ref }) => (
                    <span
                        onMouseOver={() => notAllowed && onMouseOver()}
                        onMouseOut={() => notAllowed && onMouseOut()}
                        ref={ref}
                    >
                        <button
                            disabled={notAllowed}
                            className={classes.removeButton}
                            onClick={() => onRemove(filter.id)}
                        >
                            {i18n.t('Remove')}
                        </button>
                        <style jsx>{`
                            span {
                                display: inline-flex;
                                pointer-events: all;
                                cursor: ${notAllowed ? 'not-allowed' : 'block'};
                            }
                            span > :global(button:disabled) {
                                pointer-events: none;
                            }
                        `}</style>
                    </span>
                )}
            </Tooltip>
        </div>
    )
}

FilterBadge.propTypes = {
    dashboardId: PropTypes.string.isRequired,
    filter: PropTypes.object.isRequired,
    openFilterModal: PropTypes.func.isRequired,
    onRemove: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
    dashboardId: sGetSelectedId(state),
})

export default connect(mapStateToProps, {
    openFilterModal: acSetActiveModalDimension,
})(FilterBadge)
