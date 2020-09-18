import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown'
import isEmpty from 'lodash/isEmpty'

import i18n from '@dhis2/d2-i18n'
import { DimensionsPanel } from '@dhis2/analytics'

import { Button, Popover } from '@dhis2/ui'
import FilterDialog from './FilterDialog'

import { sGetSettingsDisplayNameProperty } from '../../reducers/settings'
import { sGetActiveModalDimension } from '../../reducers/activeModalDimension'
import { sGetDimensions } from '../../reducers/dimensions'
import { sGetFiltersKeys } from '../../reducers/itemFilters'

import {
    acClearActiveModalDimension,
    acSetActiveModalDimension,
} from '../../actions/activeModalDimension'

const FilterSelector = props => {
    const [showPopover, setShowPopover] = useState(false)

    const ref = useRef(null)

    const onCloseDialog = () => {
        setShowPopover(false)

        props.clearActiveModalDimension()
    }

    const selectDimension = id => {
        props.setActiveModalDimension(
            props.dimensions.find(dimension => dimension.id === id)
        )
    }

    return (
        <>
            <span ref={ref}>
                <Button onClick={() => setShowPopover(true)}>
                    {i18n.t('Add filter')}
                    <ArrowDropDownIcon />
                </Button>
            </span>
            {showPopover && (
                <Popover
                    onClickOutside={onCloseDialog}
                    reference={ref}
                    arrow={true}
                    placement="bottom-start"
                >
                    <DimensionsPanel
                        style={{ width: '320px' }}
                        dimensions={props.dimensions}
                        onDimensionClick={selectDimension}
                        selectedIds={props.selectedDimensions}
                    />
                </Popover>
            )}
            {!isEmpty(props.dimension) ? (
                <FilterDialog
                    displayNameProperty={props.displayNameProperty}
                    dimension={props.dimension}
                    onClose={onCloseDialog}
                />
            ) : null}
        </>
    )
}

const mapStateToProps = state => ({
    displayNameProperty: sGetSettingsDisplayNameProperty(state),
    dimension: sGetActiveModalDimension(state),
    dimensions: sGetDimensions(state),
    selectedDimensions: sGetFiltersKeys(state),
})

FilterSelector.propTypes = {
    clearActiveModalDimension: PropTypes.func,
    dimension: PropTypes.object,
    dimensions: PropTypes.array,
    displayNameProperty: PropTypes.string,
    selectedDimensions: PropTypes.array,
    setActiveModalDimension: PropTypes.func,
}

export default connect(mapStateToProps, {
    clearActiveModalDimension: acClearActiveModalDimension,
    setActiveModalDimension: acSetActiveModalDimension,
})(FilterSelector)
