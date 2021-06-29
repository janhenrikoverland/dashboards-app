import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import isEmpty from 'lodash/isEmpty'
import i18n from '@dhis2/d2-i18n'
import { DimensionsPanel } from '@dhis2/analytics'
import { useOnlineStatus } from '@dhis2/app-service-offline'
import { Card, colors, IconFilter24 } from '@dhis2/ui'

import FilterDialog from './FilterDialog'
import { sGetActiveModalDimension } from '../../../reducers/activeModalDimension'
import { sGetItemFiltersRoot } from '../../../reducers/itemFilters'

import {
    acClearActiveModalDimension,
    acSetActiveModalDimension,
} from '../../../actions/activeModalDimension'
import useDimensions from '../../../modules/useDimensions'
import { DropdownButton } from '../../../components/DropdownButton'

import classes from './styles/FilterSelector.module.css'

const FilterSelector = props => {
    const [filterDialogIsOpen, setFilterDialogIsOpen] = useState(false)
    const dimensions = useDimensions(filterDialogIsOpen)
    const { isOnline } = useOnlineStatus()

    const toggleFilterDialogIsOpen = () =>
        setFilterDialogIsOpen(!filterDialogIsOpen)

    const onCloseDialog = () => {
        setFilterDialogIsOpen(false)

        props.clearActiveModalDimension()
    }

    const selectDimension = id => {
        props.setActiveModalDimension(
            dimensions.find(dimension => dimension.id === id)
        )
    }

    const filterDimensions = () => {
        if (!props.restrictFilters) {
            return dimensions
        } else {
            return dimensions.filter(d =>
                [...props.allowedFilters].includes(d.id)
            )
        }
    }

    const getFilterSelector = () => (
        <Card dataTest="dashboard-filter-popover">
            <DimensionsPanel
                style={{ width: '320px' }}
                dimensions={filterDimensions()}
                onDimensionClick={selectDimension}
                selectedIds={Object.keys(props.initiallySelectedItems)}
            />
        </Card>
    )

    return props.restrictFilters && !props.allowedFilters?.length ? null : (
        <>
            <span className={classes.buttonContainer}>
                <DropdownButton
                    open={filterDialogIsOpen}
                    disabled={!isOnline}
                    onClick={toggleFilterDialogIsOpen}
                    icon={<IconFilter24 color={colors.grey700} />}
                    component={getFilterSelector()}
                >
                    {i18n.t('Add filter')}
                </DropdownButton>
            </span>
            {!isEmpty(props.dimension) ? (
                <FilterDialog
                    dimension={props.dimension}
                    onClose={onCloseDialog}
                />
            ) : null}
        </>
    )
}

const mapStateToProps = state => ({
    dimension: sGetActiveModalDimension(state),
    initiallySelectedItems: sGetItemFiltersRoot(state),
})

FilterSelector.propTypes = {
    allowedFilters: PropTypes.array,
    clearActiveModalDimension: PropTypes.func,
    dimension: PropTypes.object,
    initiallySelectedItems: PropTypes.object,
    restrictFilters: PropTypes.bool,
    setActiveModalDimension: PropTypes.func,
}

export default connect(mapStateToProps, {
    clearActiveModalDimension: acClearActiveModalDimension,
    setActiveModalDimension: acSetActiveModalDimension,
})(FilterSelector)
