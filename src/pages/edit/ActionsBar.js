import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import i18n from '@dhis2/d2-i18n'
import TranslationDialog from '@dhis2/d2-ui-translation-dialog'
import { Button, ButtonStrip, FlyoutMenu, MenuItem } from '@dhis2/ui'
import { useDataEngine, useAlert } from '@dhis2/app-runtime'
import { useD2 } from '@dhis2/app-runtime-adapter-d2'

import FilterSettingsDialog from './FilterSettingsDialog'
import ConfirmActionDialog, {
    ACTION_DELETE,
    ACTION_DISCARD,
} from './ConfirmActionDialog'
import {
    tSaveDashboard,
    acClearEditDashboard,
    acSetPrintPreviewView,
    acClearPrintPreviewView,
    acSetFilterSettings,
    acUpdateDashboardLayout,
    acSetHideGrid,
} from '../../actions/editDashboard'
import { acClearPrintDashboard } from '../../actions/printDashboard'
import { tFetchDashboards } from '../../actions/dashboards'
import { acClearSelected } from '../../actions/selected'
import { deleteDashboardMutation } from './deleteDashboardMutation'
import {
    sGetEditDashboardRoot,
    sGetIsPrintPreviewView,
    sGetEditIsDirty,
    sGetEditDashboardItems,
} from '../../reducers/editDashboard'

import classes from './styles/ActionsBar.module.css'
import { getAutoItemShapes } from '../../modules/gridUtil'
import DropdownButton from '../../components/DropdownButton/DropdownButton'

const saveFailedMessage = i18n.t(
    'Failed to save dashboard. You might be offline or not have access to edit this dashboard.'
)

const deleteFailedMessage = i18n.t(
    'Failed to delete dashboard. You might be offline or not have access to edit this dashboard.'
)

const EditBar = ({ dashboard, ...props }) => {
    const { d2 } = useD2()
    const dataEngine = useDataEngine()
    const [translationDlgIsOpen, setTranslationDlgIsOpen] = useState(false)
    const [filterSettingsDlgIsOpen, setFilterSettingsDlgIsOpen] = useState(
        false
    )
    const [autoLayoutIsOpen, setAutoLayoutIsOpen] = useState(false)
    const [confirmDeleteDlgIsOpen, setConfirmDeleteDlgIsOpen] = useState(false)
    const [confirmDiscardDlgIsOpen, setConfirmDiscardDlgIsOpen] = useState(
        false
    )

    const [redirectUrl, setRedirectUrl] = useState(undefined)

    const saveFailureAlert = useAlert(saveFailedMessage, {
        critical: true,
    })

    const deleteFailureAlert = useAlert(deleteFailedMessage, {
        critical: true,
    })

    const onConfirmDelete = () => {
        setConfirmDeleteDlgIsOpen(true)
    }

    const onDeleteConfirmed = () => {
        setConfirmDeleteDlgIsOpen(false)

        dataEngine
            .mutate(deleteDashboardMutation, {
                variables: { id: dashboard.id },
            })
            .then(() => {
                props.clearSelected()

                return props.fetchDashboards()
            })
            .then(() => setRedirectUrl('/'))
            .catch(deleteFailureAlert.show)
    }

    const onSave = () => {
        props
            .saveDashboard()
            .then(newId => {
                props.clearSelected()
                setRedirectUrl(`/${newId}`)
            })
            .catch(() => saveFailureAlert.show())
    }

    const onPrintPreview = () => {
        if (props.isPrintPreviewView) {
            props.clearPrintPreview()
            props.clearPrintDashboard()
        } else {
            props.showPrintPreview()
        }
    }

    const onConfirmDiscard = () => {
        if (props.isDirty) {
            setConfirmDiscardDlgIsOpen(true)
        } else {
            onDiscardConfirmed()
        }
    }

    const onDiscardConfirmed = () => {
        props.onDiscardChanges()
        const redirectUrl = dashboard.id ? `/${dashboard.id}` : '/'

        setRedirectUrl(redirectUrl)
    }

    const onContinueEditing = () => {
        setConfirmDeleteDlgIsOpen(false)
        setConfirmDiscardDlgIsOpen(false)
    }

    const onFilterSettingsConfirmed = (
        filterSettingsRestrictability,
        selectedFilters
    ) => {
        const allowedFilters = filterSettingsRestrictability
            ? selectedFilters
            : []
        props.setFilterSettings({
            allowedFilters,
            restrictFilters: filterSettingsRestrictability,
        })
        toggleFilterSettingsDialog()
    }

    const toggleTranslationDialog = () =>
        setTranslationDlgIsOpen(!translationDlgIsOpen)

    const toggleFilterSettingsDialog = () => {
        setFilterSettingsDlgIsOpen(!filterSettingsDlgIsOpen)
    }

    const translationDialog = () =>
        dashboard.id ? (
            <TranslationDialog
                className="translation-dialog"
                d2={d2}
                open={translationDlgIsOpen}
                onRequestClose={toggleTranslationDialog}
                objectToTranslate={{
                    ...dashboard,
                    modelDefinition: { name: 'dashboard' },
                }}
                fieldsToTranslate={['name', 'description']}
                onTranslationError={err =>
                    console.log('translation update error', err)
                }
                onTranslationSaved={Function.prototype}
                insertTheme={true}
            />
        ) : null

    const filterSettingsDialog = () => {
        return (
            <FilterSettingsDialog
                restrictFilters={dashboard.restrictFilters}
                initiallySelectedItems={dashboard.allowedFilters}
                onClose={toggleFilterSettingsDialog}
                onConfirm={onFilterSettingsConfirmed}
                open={filterSettingsDlgIsOpen}
            />
        )
    }

    const getAutoLayoutMenuItem = numberOfCols => (
        <MenuItem
            dense
            label={`${numberOfCols} columns`}
            onClick={() => {
                setAutoLayoutIsOpen(false)
                Array.from(
                    document.querySelectorAll('.dashboard-scroll-container')
                ).forEach(el => (el.scrollTop = 0))
                props.onAutoLayoutSelect(numberOfCols)
            }}
        />
    )

    const getAutoLayoutMenu = () => (
        <FlyoutMenu>
            {new Array(10).fill().map((_, i) => getAutoLayoutMenuItem(i + 1))}
        </FlyoutMenu>
    )

    const renderActionButtons = () => (
        <ButtonStrip>
            <Button primary onClick={onSave} dataTest="save-dashboard-button">
                {i18n.t('Save changes')}
            </Button>
            <Button onClick={onPrintPreview}>
                {props.isPrintPreviewView
                    ? i18n.t('Exit Print preview')
                    : i18n.t('Print preview')}
            </Button>
            <Button onClick={toggleFilterSettingsDialog}>
                {i18n.t('Filter settings')}
            </Button>
            {dashboard.id && (
                <Button onClick={toggleTranslationDialog}>
                    {i18n.t('Translate')}
                </Button>
            )}
            {dashboard.id && dashboard.access?.delete && (
                <Button
                    onClick={onConfirmDelete}
                    dataTest="delete-dashboard-button"
                >
                    {i18n.t('Delete')}
                </Button>
            )}
            <DropdownButton
                onClick={() => {
                    setAutoLayoutIsOpen(!autoLayoutIsOpen)
                }}
                component={getAutoLayoutMenu()}
                // icon={<IconMore24 color={colors.grey700} />}
                open={autoLayoutIsOpen}
                // dataTest="delete-dashboard-button"
            >
                {i18n.t('Auto layout')}
            </DropdownButton>
        </ButtonStrip>
    )

    if (redirectUrl) {
        return <Redirect to={redirectUrl} />
    }

    const discardBtnText = dashboard.access?.update
        ? i18n.t('Exit without saving')
        : i18n.t('Go to dashboards')

    return (
        <>
            <div className={classes.editBar} data-test="edit-control-bar">
                <div className={classes.controls}>
                    {dashboard.access?.update ? renderActionButtons() : null}
                    <Button secondary onClick={onConfirmDiscard}>
                        {discardBtnText}
                    </Button>
                </div>
            </div>
            {dashboard.access?.update && filterSettingsDialog()}
            {dashboard.id && dashboard.access?.update && translationDialog()}
            {dashboard.id && dashboard.access?.delete && (
                <ConfirmActionDialog
                    action={ACTION_DELETE}
                    dashboardName={dashboard.name}
                    onConfirm={onDeleteConfirmed}
                    onCancel={onContinueEditing}
                    open={confirmDeleteDlgIsOpen}
                />
            )}
            <ConfirmActionDialog
                action={ACTION_DISCARD}
                onConfirm={onDiscardConfirmed}
                onCancel={onContinueEditing}
                open={confirmDiscardDlgIsOpen}
            />
        </>
    )
}

EditBar.propTypes = {
    clearPrintDashboard: PropTypes.func,
    clearPrintPreview: PropTypes.func,
    clearSelected: PropTypes.func,
    dashboard: PropTypes.object,
    fetchDashboards: PropTypes.func,
    isDirty: PropTypes.bool,
    isPrintPreviewView: PropTypes.bool,
    saveDashboard: PropTypes.func,
    setFilterSettings: PropTypes.func,
    showPrintPreview: PropTypes.func,
    onAutoLayoutSelect: PropTypes.func,
    onDiscardChanges: PropTypes.func,
}

const mapStateToProps = state => {
    return {
        dashboard: sGetEditDashboardRoot(state),
        isPrintPreviewView: sGetIsPrintPreviewView(state),
        isDirty: sGetEditIsDirty(state),
    }
}

const mapDispatchToProps = {
    clearPrintDashboard: () => dispatch => dispatch(acClearPrintDashboard()),
    clearPrintPreview: () => dispatch => dispatch(acClearPrintPreviewView()),
    clearSelected: () => dispatch => dispatch(acClearSelected()),
    saveDashboard: () => dispatch => dispatch(tSaveDashboard()).then(id => id),
    fetchDashboards: () => dispatch => dispatch(tFetchDashboards()),
    onDiscardChanges: () => dispatch => dispatch(acClearEditDashboard()),
    setFilterSettings: value => dispatch =>
        dispatch(acSetFilterSettings(value)),
    showPrintPreview: () => dispatch => dispatch(acSetPrintPreviewView()),
    onAutoLayoutSelect: value => (dispatch, getState) => {
        const prevItems = sGetEditDashboardItems(getState())
        const itemsWithNewShapes = getAutoItemShapes(prevItems, value)
        dispatch(acSetHideGrid(true))
        dispatch(acUpdateDashboardLayout(itemsWithNewShapes))
        setTimeout(() => dispatch(acSetHideGrid(false)), 0)
    },
}

export default connect(mapStateToProps, mapDispatchToProps)(EditBar)
