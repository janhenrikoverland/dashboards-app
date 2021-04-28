import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import i18n from '@dhis2/d2-i18n'
import TranslationDialog from '@dhis2/d2-ui-translation-dialog'
import { Button, ButtonStrip } from '@dhis2/ui'
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
} from '../../actions/editDashboard'
import { acClearPrintDashboard } from '../../actions/printDashboard'
import { tFetchDashboards } from '../../actions/dashboards'
import { deleteDashboardMutation } from './deleteDashboardMutation'
import {
    sGetEditDashboardRoot,
    sGetIsNewDashboard,
    sGetIsPrintPreviewView,
    sGetEditIsDirty,
} from '../../reducers/editDashboard'
import { apiFetchDashboard } from '../../api/fetchDashboard'
import { EDIT } from '../../modules/dashboardModes'

import classes from './styles/ActionsBar.module.css'

const saveFailedMessage = i18n.t(
    'Failed to save dashboard. You might be offline or not have access to edit this dashboard.'
)

const deleteFailedMessage = i18n.t(
    'Failed to delete dashboard. You might be offline or not have access to edit this dashboard.'
)

const EditBar = props => {
    const { d2 } = useD2()
    const dataEngine = useDataEngine()
    const [translationDlgIsOpen, setTranslationDlgIsOpen] = useState(false)
    const [filterSettingsDlgIsOpen, setFilterSettingsDlgIsOpen] = useState(
        false
    )
    const [dashboard, setDashboard] = useState(undefined)
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

    useEffect(() => {
        if (props.dashboardId && !dashboard) {
            apiFetchDashboard(
                dataEngine,
                props.dashboardId,
                EDIT
            ).then(dboard => setDashboard(dboard))
        }
    }, [props.dashboardId, dashboard])

    const onConfirmDelete = () => {
        setConfirmDeleteDlgIsOpen(true)
    }

    const onDeleteConfirmed = () => {
        setConfirmDeleteDlgIsOpen(false)

        dataEngine
            .mutate(deleteDashboardMutation, {
                variables: { id: props.dashboardId },
            })
            .then(props.fetchDashboards)
            .then(() => setRedirectUrl('/'))
            .catch(deleteFailureAlert.show)
    }

    const onSave = () => {
        props
            .saveDashboard()
            .then(newId => {
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
        const redirectUrl = props.dashboardId ? `/${props.dashboardId}` : '/'

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
        dashboard && dashboard.id ? (
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

    const filterSettingsDialog = () =>
        dashboard || props.newDashboard ? (
            <FilterSettingsDialog
                restrictFilters={props.restrictFilters}
                initiallySelectedItems={props.allowedFilters}
                onClose={toggleFilterSettingsDialog}
                onConfirm={onFilterSettingsConfirmed}
                open={filterSettingsDlgIsOpen}
            />
        ) : null

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
            {props.dashboardId && (
                <Button onClick={toggleTranslationDialog}>
                    {i18n.t('Translate')}
                </Button>
            )}
            {props.dashboardId && props.deleteAccess && (
                <Button
                    onClick={onConfirmDelete}
                    dataTest="delete-dashboard-button"
                >
                    {i18n.t('Delete')}
                </Button>
            )}
        </ButtonStrip>
    )

    if (redirectUrl) {
        return <Redirect to={redirectUrl} />
    }

    const discardBtnText = props.updateAccess
        ? i18n.t('Exit without saving')
        : i18n.t('Go to dashboards')

    return (
        <>
            <div className={classes.editBar} data-test="edit-control-bar">
                <div className={classes.controls}>
                    {props.updateAccess ? renderActionButtons() : null}
                    <Button secondary onClick={onConfirmDiscard}>
                        {discardBtnText}
                    </Button>
                </div>
            </div>
            {filterSettingsDialog()}
            {translationDialog()}
            {props.deleteAccess && props.dashboardId && (
                <ConfirmActionDialog
                    action={ACTION_DELETE}
                    dashboardName={props.dashboardName}
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
    allowedFilters: PropTypes.array,
    clearPrintDashboard: PropTypes.func,
    clearPrintPreview: PropTypes.func,
    dashboardId: PropTypes.string,
    dashboardName: PropTypes.string,
    deleteAccess: PropTypes.bool,
    fetchDashboards: PropTypes.func,
    isDirty: PropTypes.bool,
    isPrintPreviewView: PropTypes.bool,
    newDashboard: PropTypes.bool,
    restrictFilters: PropTypes.bool,
    saveDashboard: PropTypes.func,
    setFilterSettings: PropTypes.func,
    showPrintPreview: PropTypes.func,
    updateAccess: PropTypes.bool,
    onDiscardChanges: PropTypes.func,
}

const mapStateToProps = state => {
    const dashboard = sGetEditDashboardRoot(state)
    let newDashboard
    let deleteAccess
    let updateAccess
    if (sGetIsNewDashboard(state)) {
        newDashboard = true
        deleteAccess = true
        updateAccess = true
    } else {
        newDashboard = false
        updateAccess = dashboard.access ? dashboard.access.update : false
        deleteAccess = dashboard.access ? dashboard.access.delete : false
    }

    return {
        allowedFilters: dashboard.allowedFilters,
        dashboardId: dashboard.id,
        dashboardName: dashboard.name,
        deleteAccess,
        newDashboard,
        restrictFilters: dashboard.restrictFilters,
        isPrintPreviewView: sGetIsPrintPreviewView(state),
        updateAccess,
        isDirty: sGetEditIsDirty(state),
    }
}

const mapDispatchToProps = dispatch => ({
    clearPrintDashboard: () => dispatch(acClearPrintDashboard()),
    clearPrintPreview: () => dispatch(acClearPrintPreviewView()),
    saveDashboard: () => dispatch(tSaveDashboard()).then(id => id),
    fetchDashboards: () => dispatch(tFetchDashboards()),
    onDiscardChanges: () => dispatch(acClearEditDashboard()),
    setFilterSettings: value => dispatch(acSetFilterSettings(value)),
    showPrintPreview: () => dispatch(acSetPrintPreviewView()),
})

export default connect(mapStateToProps, mapDispatchToProps)(EditBar)
