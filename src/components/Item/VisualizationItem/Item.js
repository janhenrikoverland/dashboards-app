import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import VisualizationPlugin from '@dhis2/data-visualizer-plugin';

import i18n from '@dhis2/d2-i18n';
import uniqueId from 'lodash/uniqueId';

import DefaultPlugin from './DefaultPlugin';
import ItemHeader from '../ItemHeader';
import ItemHeaderButtons from './ItemHeaderButtons';
import ItemFooter from './ItemFooter';
import * as pluginManager from './plugin';
import { sGetVisualization } from '../../../reducers/visualizations';
import { sGetCurrentVisualizationView } from '../../../reducers/currentVisualizationViews';
import { sGetItemFiltersRoot } from '../../../reducers/itemFilters';
import {
    acAddVisualization,
    acSetActiveVisualizationType,
} from '../../../actions/visualizations';
import { acSetCurrentVisualizationView } from '../../../actions/currentVisualizationViews';
import {
    VISUALIZATION,
    MAP,
    CHART,
    REPORT_TABLE,
} from '../../../modules/itemTypes';

import { colors } from '@dhis2/ui-core';
import memoizeOne from '../../../modules/memoizeOne';
import { getVisualizationConfig } from './plugin';

const HEADER_HEIGHT = 45;

const styles = {
    icon: {
        width: 16,
        height: 16,
        marginLeft: 3,
        cursor: 'pointer',
        fill: colors.grey600,
    },
    title: {
        overflow: 'hidden',
        maxWidth: '85%',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    textDiv: {
        fontSize: '14px',
        fontStretch: 'normal',
        padding: '10px',
        lineHeight: '20px',
    },
};

const applyFilters = (visualization, filters) => {
    if (!Object.keys(filters).length) {
        return visualization;
    }

    // deep clone objects in filters to avoid changing the visualization in the Redux store
    const visRows = visualization.rows.map(obj => ({ ...obj }));
    const visColumns = visualization.columns.map(obj => ({ ...obj }));
    const visFilters = visualization.filters.map(obj => ({ ...obj }));

    Object.keys(filters).forEach(dimensionId => {
        if (filters[dimensionId]) {
            let dimensionFound = false;

            [visRows, visColumns, visFilters].forEach(dimensionObjects =>
                dimensionObjects
                    .filter(obj => obj.dimension === dimensionId)
                    .forEach(obj => {
                        dimensionFound = true;
                        obj.items = filters[dimensionId];
                    })
            );

            // add dimension to filters if not already present elsewhere
            if (!dimensionFound) {
                visFilters.push({
                    dimension: dimensionId,
                    items: filters[dimensionId],
                });
            }
        }
    });

    return {
        ...visualization,
        rows: visRows,
        columns: visColumns,
        filters: visFilters,
    };
};

export class Item extends Component {
    state = {
        showFooter: false,
        configLoaded: false,
    };

    constructor(props, context) {
        super(props);

        this.d2 = context.d2;

        this.contentRef = React.createRef();
    }

    async componentDidMount() {
        const vis = await pluginManager.fetch(this.props.item);
        // TODO do not call fetch on the pluginManager, do it here as the manager will eventually be removed...
        this.props.onVisualizationLoaded(vis);
        this.props.onSelectVisualizationView(this.props.visualization.id, vis);

        this.setState({
            configLoaded: true,
        });
    }

    getUniqueKey = memoizeOne(() => uniqueId());

    pluginCredentials = null;

    getPluginComponent = () => {
        const {
            itemFilters,
            editMode,
            item,
            classes,
            visualization,
            currentVisualizationView,
        } = this.props;

        if (!currentVisualizationView) {
            return (
                <div className={this.props.classes.textDiv}>
                    {i18n.t('No data to display')}
                </div>
            );
        }
        const style = this.getContentStyle();

        // console.log(
        //     'current',
        //     currentVisualizationView.name,
        //     currentVisualizationView.type
        // );

        switch (this.getActiveType()) {
            case VISUALIZATION:
            case CHART:
            case REPORT_TABLE: {
                return (
                    <VisualizationPlugin
                        d2={this.d2}
                        visualization={applyFilters(
                            currentVisualizationView,
                            itemFilters
                        )}
                        forDashboard={true}
                        style={style}
                    />
                );
            }
            case MAP: {
                let vis = currentVisualizationView;
                if (item.type === MAP) {
                    // apply filters only to thematic and event layers
                    // for maps AO
                    const mapViews = visualization.mapViews.map(obj => {
                        if (
                            obj.layer.includes('thematic') ||
                            obj.layer.includes('event')
                        ) {
                            return applyFilters(obj, itemFilters);
                        }

                        return obj;
                    });

                    vis = {
                        ...currentVisualizationView,
                        mapViews,
                    };
                } else {
                    // this is the case of a non map AO passed to the maps plugin
                    // due to a visualization type switch in dashboard item
                    // maps plugin takes care of converting the AO to a suitable format
                    vis = applyFilters(
                        {
                            currentVisualizationView,
                            itemFilters,
                        },
                        itemFilters
                    );
                }

                return (
                    <DefaultPlugin
                        visualization={vis}
                        itemFilters={itemFilters}
                        item={item}
                        editMode={editMode}
                        classes={classes}
                        style={style}
                    />
                );
            }
            default: {
                const vis = applyFilters(currentVisualizationView, itemFilters);

                return (
                    <DefaultPlugin
                        visualization={vis}
                        itemFilters={itemFilters}
                        item={item}
                        editMode={editMode}
                        classes={classes}
                        style={style}
                    />
                );
            }
        }
    };

    onToggleFooter = () => {
        this.setState(
            { showFooter: !this.state.showFooter },
            this.props.onToggleItemExpanded(this.props.item.id)
        );
    };

    onSelectActiveType = type => {
        if (type === this.getActiveType()) {
            return;
        }

        pluginManager.unmount(this.props.item, this.getActiveType());

        this.props.onSelectActiveType(this.props.visualization.id, type);

        const visualization = getVisualizationConfig(
            this.props.visualization,
            this.props.item.type,
            type
        );

        this.props.onSelectVisualizationView(
            this.props.visualization.id,
            visualization
        );
    };

    getActiveType = () =>
        this.props.visualization.activeType || this.props.item.type;

    pluginIsAvailable = () =>
        pluginManager.pluginIsAvailable(
            this.props.item,
            this.props.visualization
        );

    getContentStyle = () => {
        const { item, editMode } = this.props;
        const PADDING_BOTTOM = 4;

        return !editMode
            ? {
                  height: item.originalHeight - HEADER_HEIGHT - PADDING_BOTTOM,
              }
            : { height: this.contentRef.offsetHeight };
    };

    render() {
        const { item, editMode, itemFilters } = this.props;
        const { showFooter } = this.state;

        const actionButtons = (
            <ItemHeaderButtons
                item={item}
                visualization={this.props.visualization}
                onSelectActiveType={this.onSelectActiveType}
                onToggleFooter={this.onToggleFooter}
                d2={this.d2}
                activeType={this.getActiveType()}
                activeFooter={this.state.showFooter}
            />
        );

        return (
            <>
                <ItemHeader
                    title={pluginManager.getName(item)}
                    itemId={item.id}
                    actionButtons={actionButtons}
                />
                <div
                    key={this.getUniqueKey(itemFilters)}
                    className="dashboard-item-content"
                    ref={ref => (this.contentRef = ref)}
                >
                    {this.state.configLoaded && this.getPluginComponent()}
                </div>
                {!editMode && showFooter ? <ItemFooter item={item} /> : null}
            </>
        );
    }
}

Item.contextTypes = {
    d2: PropTypes.object,
};

Item.propTypes = {
    classes: PropTypes.object,
    currentVisualizationView: PropTypes.object,
    editMode: PropTypes.bool,
    item: PropTypes.object,
    itemFilters: PropTypes.object,
    visualization: PropTypes.object,
    onSelectActiveType: PropTypes.func,
    onSelectVisualizationView: PropTypes.func,
    onToggleItemExpanded: PropTypes.func,
    onVisualizationLoaded: PropTypes.func,
};

Item.defaultProps = {
    item: {},
    editMode: false,
    onToggleItemExpanded: Function.prototype,
    itemFilters: {},
    visualization: {},
};

const mapStateToProps = (state, ownProps) => ({
    itemFilters: sGetItemFiltersRoot(state),
    visualization: sGetVisualization(
        state,
        pluginManager.extractFavorite(ownProps.item).id
    ),
    currentVisualizationView: sGetCurrentVisualizationView(
        state,
        pluginManager.extractFavorite(ownProps.item).id
    ),
});

const mapDispatchToProps = dispatch => ({
    onVisualizationLoaded: visualization =>
        dispatch(acAddVisualization(visualization)),
    onSelectActiveType: (id, type) =>
        dispatch(acSetActiveVisualizationType(id, type)),
    onSelectVisualizationView: (id, visualization) => {
        dispatch(acSetCurrentVisualizationView({ id, visualization }));
    },
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(Item));
