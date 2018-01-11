import React, { Component } from 'react';
import { connect } from 'react-redux';
import TextField from 'd2-ui/lib/text-field/TextField';
import Button from 'd2-ui/lib/button/Button';

import Interpretation from './Interpretation';
import { tGetInterpretations, tPostInterpretation } from './actions';
import * as fromReducers from '../../reducers';
import { colors } from '../../styleGuide';

const style = {
    button: {
        height: '30px',
        width: '16.84px',
        color: colors.charcoalGrey,
        fontFamily: 'inherit',
        fontSize: '13px',
        lineHeight: '15px',
    },
    container: {
        overflowY: 'scroll',
        height: 320,
        padding: 5,
    },
    interpretationBox: {
        marginBottom: '10px',
    },
    interpretationText: {
        fontSize: '14px',
        fontStretch: 'normal',
    },
    item: {
        borderBottom: `1px solid ${colors.lightGrey}`,
        marginBottom: 10,
        paddingBottom: 10,
    },
    list: {
        listStyleType: 'none',
        paddingLeft: '0px',
    },
    newInterpretation: {
        width: '80%',
        display: 'inline-block',
    },
    title: {
        color: colors.black,
        fontSize: '13px',
        fontWeight: 'bold',
        height: '19px',
        lineHeight: '19px',
    },
};

class Interpretations extends Component {
    state = {
        newInterpretationText: '',
    };

    updateNewInterpretationText = newInterpretationText => {
        this.setState({ newInterpretationText });
    };

    postInterpretation = () => {
        const data = {
            objectType: this.props.objectType,
            objectId: this.props.objectId,
            text: this.state.newInterpretationText,
        };

        this.props.postInterpretation(data, this.props.dashboardId);
        this.setState({ newInterpretationText: '' });
    };

    interpretationsLoaded = () => {
        const isLoaded =
            this.props.ids.length &&
            this.props.ids.length ===
                Object.keys(this.props.interpretations).length;

        return isLoaded;
    };

    loadInterpretations = () => {
        if (!this.interpretationsLoaded()) {
            const idsToGet = this.props.ids.filter(
                id => !this.props.interpretations[id]
            );

            this.props.getInterpretations(idsToGet);
        }
    };

    componentDidMount() {
        this.loadInterpretations();
    }

    sortByDate = () => {
        const values = Object.values(this.props.interpretations);

        values.sort((a, b) => {
            const aDate = new Date(a.created);
            const bDate = new Date(b.created);

            return aDate - bDate;
        });

        return values;
    };

    renderItems() {
        let Items = null;
        if (this.interpretationsLoaded()) {
            const sorted = this.sortByDate();
            Items = sorted.map(item => {
                return (
                    <li style={style.item} key={item.id}>
                        <Interpretation
                            item={item}
                            objectId={this.props.objectId}
                            objectType={this.props.objectType}
                        />
                    </li>
                );
            });
        }
        return Items;
    }

    render() {
        return (
            <div style={style.container}>
                <h3 style={style.title}>
                    Interpretations ({this.props.ids.length})
                </h3>
                <ul style={style.list}>{this.renderItems()}</ul>
                <div style={style.interpretationBox}>
                    <div style={style.newInterpretation}>
                        <TextField
                            multiLine
                            value={this.state.newInterpretationText}
                            rows={1}
                            rowsMax={8}
                            fullWidth
                            style={style.interpretationText}
                            placeholder="Write your own interpretation"
                            onChange={this.updateNewInterpretationText}
                        />
                    </div>
                    <Button
                        style={style.button}
                        onClick={this.postInterpretation}
                    >
                        Post
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { fromVisualizations, fromInterpretations } = fromReducers;
    const ids = fromVisualizations
        .sGetVisInterpretations(state, ownProps.objectId)
        .map(i => i.id);

    return {
        ids,
        interpretations: fromInterpretations.sGetInterpretations(state, ids),
    };
};

const mapDispatchToProps = dispatch => {
    return {
        getInterpretations: ids => dispatch(tGetInterpretations(ids)),
        postInterpretation: data => dispatch(tPostInterpretation(data)),
    };
};

const InterpretationsContainer = connect(mapStateToProps, mapDispatchToProps)(
    Interpretations
);

export default InterpretationsContainer;
