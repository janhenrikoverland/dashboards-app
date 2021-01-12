import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { colors } from '@dhis2/ui'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'
import DescriptionIcon from '../../../icons/Description'
import DeleteIcon from '../../../icons/Delete'
import Line from '../../../widgets/Line'
import { itemTypeMap, getItemUrl } from '../../../modules/itemTypes'
import { orArray } from '../../../modules/util'
import { tRemoveListItemContent } from './actions'
import ItemHeader from '../ItemHeader/ItemHeader'
import { isEditMode } from '../../Dashboard/dashboardModes'

import classes from './Item.module.css'

const getItemTitle = item => itemTypeMap[item.type].pluralTitle

const getContentItems = item =>
    orArray(item[itemTypeMap[item.type].propName]).filter(
        (item, index, array) =>
            array.findIndex(el => el.id === item.id) === index
    )

const ListItem = ({ item, dashboardMode, tRemoveListItemContent }) => {
    const { d2 } = useD2({})
    const contentItems = getContentItems(item)

    const getLink = contentItem => {
        const deleteButton = (
            <button
                className={classes.deletebutton}
                onClick={() => tRemoveListItemContent(item, contentItem)}
            >
                <DeleteIcon className={classes.deleteicon} />
            </button>
        )

        return (
            <>
                <a
                    className={classes.link}
                    style={{ color: colors.grey900 }}
                    href={getItemUrl(item.type, contentItem, d2)}
                >
                    {contentItem.name}
                </a>
                {isEditMode(dashboardMode) ? deleteButton : null}
            </>
        )
    }

    return (
        <>
            <ItemHeader
                title={getItemTitle(item)}
                itemId={item.id}
                dashboardMode={dashboardMode}
                isShortened={item.shortened}
            />
            <Line />
            <div className="dashboard-item-content">
                <ul className={classes.list}>
                    {contentItems.map(contentItem => (
                        <li className={classes.item} key={contentItem.id}>
                            <DescriptionIcon className={classes.itemicon} />
                            {getLink(contentItem)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    )
}

ListItem.propTypes = {
    dashboardMode: PropTypes.string,
    item: PropTypes.object,
    tRemoveListItemContent: PropTypes.func,
}

export default connect(null, {
    tRemoveListItemContent,
})(ListItem)
