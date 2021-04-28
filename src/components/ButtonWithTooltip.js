import React from 'react'
import PropTypes from 'prop-types'
import i18n from '@dhis2/d2-i18n'
import { Button, Tooltip } from '@dhis2/ui'
import { useOnlineStatus } from '../modules/useOnlineStatus'

const ButtonWithTooltip = ({ disabledWhenOffline, children, ...rest }) => {
    const { isOnline } = useOnlineStatus()

    if (disabledWhenOffline && !isOnline) {
        return (
            <Tooltip
                content={i18n.t('Not available offline')}
                openDelay={200}
                closeDelay={100}
            >
                <Button disabled={!isOnline} {...rest}>
                    {children}
                </Button>
            </Tooltip>
        )
    }

    return <Button {...rest}>{children}</Button>
}

ButtonWithTooltip.propTypes = {
    children: PropTypes.node,
    disabledWhenOffline: PropTypes.bool,
}

ButtonWithTooltip.defaultProps = {
    disabledWhenOffline: true,
}

export default ButtonWithTooltip
