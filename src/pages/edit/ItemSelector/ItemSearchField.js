import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { InputField, Tooltip } from '@dhis2/ui'
import { useOnlineStatus } from '@dhis2/app-service-offline'

const ItemSearchField = props => {
    const { isOnline } = useOnlineStatus()

    const getInput = () => (
        <InputField
            name="Dashboard item search"
            label={i18n.t('Search for items to add to this dashboard')}
            type="text"
            onChange={props.onChange}
            onFocus={props.onFocus}
            value={props.value}
            dataTest="item-search"
            disabled={!isOnline}
        />
    )

    if (isOnline) {
        return <>{getInput()}</>
    }

    return (
        <Tooltip
            content={i18n.t('Cannot search for dashboard items while offline')}
            openDelay={200}
            closeDelay={100}
        >
            {getInput()}
        </Tooltip>
    )
}

ItemSearchField.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func,
    onFocus: PropTypes.func,
}

export default ItemSearchField
