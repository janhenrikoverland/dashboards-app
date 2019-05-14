import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18n from '@dhis2/d2-i18n';
import { MenuItem, Divider } from '@dhis2/ui-core';

import HeaderMenuItem from './HeaderMenuItem';
import ContentMenuItem from './ContentMenuItem';

import { tAddListItemContent } from './actions';
import { acAddDashboardItem } from '../../actions/editDashboard';
import { sGetEditDashboardRoot } from '../../reducers/editDashboard';
import {
    getItemUrl,
    categorizedItemTypes,
    listItemTypes,
    APP,
} from '../../modules/itemTypes';

import classes from './styles/ItemSelectList.module.css';

class ItemSelectList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            seeMore: false,
        };
    }

    addItem = item => () => {
        const {
            type,
            dashboardId,
            acAddDashboardItem,
            tAddListItemContent,
        } = this.props;

        if (type === APP) {
            acAddDashboardItem({ type, content: item.key });
        } else {
            const newItem = {
                id: item.id,
                name: item.displayName || item.name,
            };

            if (listItemTypes.includes(type)) {
                tAddListItemContent(dashboardId, type, newItem);
            } else {
                acAddDashboardItem({ type, content: newItem });
            }
        }
    };

    toggleSeeMore = () => {
        this.setState({ seeMore: !this.state.seeMore });

        this.props.onChangeItemsLimit(this.props.type);
    };

    render() {
        const { title, type, items } = this.props;
        return (
            <Fragment>
                <HeaderMenuItem title={title} />
                {items.map(item => {
                    const itemUrl = getItemUrl(type, item, this.context.d2);
                    return (
                        <ContentMenuItem
                            key={item.id || item.key}
                            type={type}
                            name={item.displayName || item.name}
                            onInsert={this.addItem(item)}
                            url={itemUrl}
                        />
                    );
                })}
                <MenuItem
                    dense
                    key={`showmore${title}`}
                    onClick={this.toggleSeeMore}
                    label={
                        <button className={classes.showMoreButton}>
                            {this.state.seeMore
                                ? i18n.t('Show fewer')
                                : i18n.t('Show more')}
                        </button>
                    }
                />
                <Divider margin="8px 0px" />
            </Fragment>
        );
    }
}

ItemSelectList.propTypes = {
    type: PropTypes.oneOf(categorizedItemTypes).isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.array.isRequired,
    onChangeItemsLimit: PropTypes.func.isRequired,
};

ItemSelectList.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default connect(
    state => ({
        dashboardId: sGetEditDashboardRoot(state).id,
    }),
    {
        acAddDashboardItem,
        tAddListItemContent,
    }
)(ItemSelectList);
