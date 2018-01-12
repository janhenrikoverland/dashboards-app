import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ReactGridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import './ItemGrid.css';
import PluginItem from '../Item/PluginItem/Item';

import {
    GRID_ROW_HEIGHT,
    GRID_COMPACT_TYPE,
    getGridColumns,
    hasShape,
} from './gridUtil';
import {
    getPluginByType,
    getFavoriteObjectFromItem,
    getPluginItemConfig,
    renderFavorites,
    onPluginItemResize,
} from './pluginUtil';

import { orArray } from '../util';
import * as fromReducers from '../reducers';
import { apiFetchFavorite } from '../api';
import ModalLoadingMask from '../widgets/ModalLoadingMask';

// Component

let cachedIds = '';
let cachedEdit = false;

const shouldPluginUpdate = (dashboardItems, edit) => {
    if (dashboardItems.length) {
        const ids = dashboardItems.map(item => item.id).join('-');
        console.log('shouldPluginUpdate', ids);
        if (ids.length && (ids !== cachedIds || edit !== cachedEdit)) {
            cachedIds = ids;
            cachedEdit = edit;

            return true;
        }
    }

    return false;
};

const NoItemsMessage = ({ text }) => (
    <div
        style={{
            padding: '50px 10px',
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: 500,
            color: '#777',
        }}
    >
        {text}
    </div>
);

export class ItemGrid extends Component {
    state = {
        expandedItems: {},
    };

    NO_ITEMS_MESSAGE = 'You have not added any items';

    componentDidUpdate() {
        const { dashboardItems, edit } = this.props;

        if (shouldPluginUpdate(dashboardItems, edit)) {
            renderFavorites(dashboardItems);
        }
    }

    componentWillUpdate() {
        //console.log('CWU');
    }

    onToggleItemFooter = clickedId => {
        const isExpanded =
            typeof this.state.expandedItems[clickedId] === 'boolean'
                ? this.state.expandedItems[clickedId]
                : false;

        const expandedItems = { ...this.state.expandedItems };
        expandedItems[clickedId] = !isExpanded;

        this.setState({ expandedItems });
    };

    onLayoutChange = (a, b, c) => {
        //console.log('RGL change', a, b, c);
    };

    render() {
        const {
            edit,
            isLoading,
            dashboardItems,
            onButtonClick,
            onResizeStop,
        } = this.props;

        if (!dashboardItems.length) {
            return <NoItemsMessage text={this.NO_ITEMS_MESSAGE} />;
        }

        const pluginItems = dashboardItems.map((item, index) => {
            const expandedItem = this.state.expandedItems[item.id];
            let hProp = { h: item.h };

            if (expandedItem && expandedItem === true) {
                hProp.h = item.h + 20;
            }

            return Object.assign({}, item, hProp, {
                i: item.id,
            });
        });

        return (
            <div className="grid-wrapper">
                <ModalLoadingMask isLoading={isLoading} />
                <ReactGridLayout
                    onLayoutChange={this.onLayoutChange}
                    onResizeStop={onResizeStop}
                    className="layout"
                    layout={pluginItems}
                    cols={getGridColumns()}
                    rowHeight={GRID_ROW_HEIGHT}
                    width={window.innerWidth}
                    compactType={GRID_COMPACT_TYPE}
                    isDraggable={edit}
                    isResizable={edit}
                >
                    {pluginItems
                        .filter(item => getFavoriteObjectFromItem(item)) //TODO IMPROVE
                        .map(item => {
                            return (
                                <div key={item.i} className={item.type}>
                                    <PluginItem
                                        item={item}
                                        editMode={edit}
                                        onButtonClick={onButtonClick}
                                        onToggleItemFooter={
                                            this.onToggleItemFooter
                                        }
                                    />
                                </div>
                            );
                        })}
                </ReactGridLayout>
            </div>
        );
    }
}

ItemGrid.propTypes = {
    dashboardItems: PropTypes.array,
};

ItemGrid.defaultProps = {
    dashboardItems: [],
};

// Container

const currentItemTypeMap = {}; // TODO: improve

const onButtonClick = (id, type, targetType) => {
    const plugin = getPluginByType(targetType);

    apiFetchFavorite(id, type).then(favorite => {
        const itemConfig = getPluginItemConfig(favorite, true);

        plugin.load(itemConfig);

        currentItemTypeMap[id] = targetType;
    });
};

const onItemResize = id => {
    if (
        [undefined, 'CHART', 'EVENT_CHART'].indexOf(currentItemTypeMap[id]) !==
        -1
    ) {
        onPluginItemResize(id);
    }
};

const onResizeStop = (layout, oldItem, newItem) => {
    onItemResize(newItem.i);
};

const mapStateToProps = state => {
    const { sGetSelectedDashboard, fromSelected } = fromReducers;
    const { sGetSelectedIsLoading, sGetSelectedEdit } = fromSelected;

    const selectedDashboard = sGetSelectedDashboard(state);

    const dashboardItems = selectedDashboard
        ? selectedDashboard.dashboardItems
        : null;

    console.log(
        'MSTP',
        sGetSelectedEdit(state),
        sGetSelectedIsLoading(state),
        dashboardItems
    );

    return {
        edit: sGetSelectedEdit(state),
        isLoading: sGetSelectedIsLoading(state),
        dashboardItems,
    };
};

const mergeProps = (stateProps, dispatchProps) => {
    const validItems = orArray(stateProps.dashboardItems).filter(hasShape);
    console.log('-- MP', validItems);
    return {
        edit: stateProps.edit,
        isLoading: stateProps.isLoading,
        dashboardItems: validItems,
        onButtonClick,
        onItemResize,
        onResizeStop,
    };
};

const ItemGridCt = connect(mapStateToProps, null, mergeProps)(ItemGrid);

export default ItemGridCt;
