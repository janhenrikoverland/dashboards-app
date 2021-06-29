import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { useOnlineStatus } from '@dhis2/app-service-offline'

import FilterBadge from './FilterBadge'
import ConfirmActionDialog from '../../../components/ConfirmActionDialog'

import { sGetNamedItemFilters } from '../../../reducers/itemFilters'
import {
    acRemoveItemFilter,
    acClearItemFilters,
} from '../../../actions/itemFilters'

import classes from './styles/FilterBar.module.css'

const FilterBar = ({ filters, removeFilter, removeAllFilters }) => {
    const { isOnline } = useOnlineStatus()
    const [dialogIsOpen, setDialogIsOpen] = useState(false)

    const onRemoveFilter = filterId => {
        if (!isOnline && filters.length > 1) {
            setDialogIsOpen(true)
        } else {
            removeFilter(filterId)
        }
    }

    const closeDialog = () => setDialogIsOpen(false)

    return filters.length ? (
        <>
            <div className={classes.bar}>
                {filters.map(filter => (
                    <FilterBadge
                        key={filter.id}
                        filter={filter}
                        onRemove={onRemoveFilter}
                    />
                ))}
            </div>
            <ConfirmActionDialog
                open={dialogIsOpen}
                title={i18n.t('Removing filters while offline')}
                message={i18n.t(
                    'Removing this filter while offline will remove all other filters. Do you want to remove all filters on this dashboard?'
                )}
                cancelLabel={i18n.t('No, cancel')}
                confirmLabel={i18n.t('Yes, remove filters')}
                onConfirm={removeAllFilters}
                onCancel={closeDialog}
            />
        </>
    ) : null
}

FilterBar.propTypes = {
    filters: PropTypes.array.isRequired,
    removeAllFilters: PropTypes.func.isRequired,
    removeFilter: PropTypes.func.isRequired,
}

FilterBar.defaultProps = {
    filters: [],
}

const mapStateToProps = state => ({
    filters: sGetNamedItemFilters(state),
})

export default connect(mapStateToProps, {
    removeAllFilters: acClearItemFilters,
    removeFilter: acRemoveItemFilter,
})(FilterBar)
