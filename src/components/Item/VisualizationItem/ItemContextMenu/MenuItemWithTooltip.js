import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { MenuItem, Tooltip } from '@dhis2/ui'
import { useOnlineStatus } from '@dhis2/app-service-offline'

const MenuItemWithTooltip = ({
    disabledWhenOffline,
    tooltip,
    label,
    ...rest
}) => {
    const { isOnline } = useOnlineStatus()

    const tooltipContent =
        disabledWhenOffline && !isOnline
            ? i18n.t('Not available offline')
            : tooltip

    const notAllowed = disabledWhenOffline && !isOnline

    const getLabelWithTooltip = () => {
        return (
            <Tooltip content={tooltipContent} openDelay={200} closeDelay={100}>
                {({ onMouseOver, onMouseOut, ref }) => (
                    <span
                        onMouseOver={() => notAllowed && onMouseOver()}
                        onMouseOut={() => notAllowed && onMouseOut()}
                        ref={ref}
                    >
                        {label}
                        <style jsx>{`
                            span {
                                display: inline-flex;
                                pointer-events: all;
                                cursor: ${notAllowed ? 'not-allowed' : 'block'};
                            }
                        `}</style>
                    </span>
                )}
            </Tooltip>
        )
    }

    return (
        <MenuItem
            dense
            disabled={notAllowed}
            label={getLabelWithTooltip()}
            {...rest}
        />
    )
}

MenuItemWithTooltip.propTypes = {
    disabledWhenOffline: PropTypes.bool,
    label: PropTypes.string,
    tooltip: PropTypes.string,
}

MenuItemWithTooltip.defaultProps = {
    disabledWhenOffline: true,
    tooltip: '',
}

export default MenuItemWithTooltip
