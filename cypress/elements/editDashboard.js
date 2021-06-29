import { EXTENDED_TIMEOUT } from '../support/utils'
import { newButtonSel } from './viewDashboard'

export const confirmActionDialogSel = '[data-test="confirm-action-dialog"]'
export const titleInputSel = '[data-test="dashboard-title-input"]'
export const itemMenuSel = '[data-test="item-menu"]'
export const itemSearchSel = '[data-test="item-search"]'

export const actionsBarSel = '[data-test="edit-control-bar"]'

export const getEditActionButton = action =>
    cy
        .get(actionsBarSel, EXTENDED_TIMEOUT)
        .find('button')
        .contains(action, EXTENDED_TIMEOUT)

export const clickEditActionButton = action =>
    cy
        .get(actionsBarSel, EXTENDED_TIMEOUT)
        .find('button')
        .contains(action, EXTENDED_TIMEOUT)
        .click()

export const createDashboard = (title, items) => {
    cy.get(newButtonSel, EXTENDED_TIMEOUT).click()
    // add title
    cy.get(titleInputSel).type(title)

    // add the item
    items.forEach(itemName => {
        cy.get('[data-test="item-search"]').click()
        cy.get('[data-test="item-search"]')
            .find('input')
            .type(itemName, { force: true })

        cy.get(`[data-test="menu-item-${itemName}"]`).click()

        cy.get('[data-test="dhis2-uicore-layer"]').click('topLeft')
    })

    cy.get('button').contains('Save changes', EXTENDED_TIMEOUT).click()
}
