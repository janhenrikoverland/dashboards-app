import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { fromDashboards, fromSelected } from '../reducers';
import PageContainer from '../PageContainer/PageContainer';
import PageContainerSpacer from '../PageContainer/PageContainerSpacer';
import EditBar from '../ControlBarContainer/EditBar';
import {
    acSetEditNewDashboard,
    acSetEditDashboard,
} from '../actions/editDashboard';

class EditDashboard extends Component {
    initEditDashboard = () => {
        if (this.props.mode === 'new') {
            this.props.setNewDashboard();
        } else {
            if (this.props.dashboard) {
                this.props.setEditDashboard(
                    this.props.dashboard,
                    this.props.items
                );
            }
        }
    };

    componentDidMount() {
        this.initEditDashboard();
    }

    componentDidUpdate() {
        this.initEditDashboard();
    }

    render() {
        return (
            <Fragment>
                <EditBar />
                <PageContainerSpacer />
                <PageContainer />
            </Fragment>
        );
    }
}

const mapStateToProps = state => {
    const selectedId = fromSelected.sGetSelectedId(state);
    const dashboard = selectedId
        ? fromDashboards.sGetById(state, selectedId)
        : null;

    const items = fromDashboards.sGetItems(state);

    return {
        dashboard,
        items,
    };
};

export default connect(mapStateToProps, {
    setNewDashboard: acSetEditNewDashboard,
    setEditDashboard: acSetEditDashboard,
})(EditDashboard);
