import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { t } from 'dhis2-i18n';

import ItemSelect from '../ItemSelect/ItemSelect';
import D2ContentEditable from '../widgets/D2ContentEditable';
import { fromEditDashboard } from '../actions';

const EditTitleBar = ({
    name,
    displayName,
    description,
    style,
    onChangeTitle,
    onChangeDescription,
}) => {
    const titleBarEdit = Object.assign({}, style.titleBar, {
        justifyContent: 'space-between',
    });
    const titleStyle = Object.assign({}, style.title, {
        top: '-2px',
    });

    const translatedName = () => {
        return displayName ? (
            <span style={style.description}>
                Current translation: {displayName}
            </span>
        ) : null;
    };

    return (
        <Fragment>
            <span>Currently editing</span>
            <div style={titleBarEdit}>
                <div style={{ padding: '6px 0' }}>
                    <div style={titleStyle}>
                        <D2ContentEditable
                            className="dashboard-title editable-text"
                            text={name}
                            disabled={false}
                            placeholder={t('Add title here')}
                            onChange={onChangeTitle}
                        />
                    </div>
                    {translatedName()}
                </div>
                <ItemSelect />
            </div>
            <div style={style.description}>
                <D2ContentEditable
                    className="dashboard-description editable-text"
                    text={description}
                    disabled={false}
                    placeholder={t('Add description here')}
                    onChange={onChangeDescription}
                />
            </div>
        </Fragment>
    );
};

const mapDispatchToProps = dispatch => ({
    onChangeTitle: event =>
        dispatch(fromEditDashboard.acSetDashboardTitle(event.target.value)),
    onChangeDescription: event =>
        dispatch(
            fromEditDashboard.acSetDashboardDescription(event.target.value)
        ),
});

const TitleBarCt = connect(null, mapDispatchToProps)(EditTitleBar);

export default TitleBarCt;

EditTitleBar.propTypes = {
    name: PropTypes.string,
    displayName: PropTypes.string,
    description: PropTypes.string,
};

EditTitleBar.defaultProps = {
    name: '',
    displayName: '',
    description: '',
};
