import { Given, Then } from 'cypress-cucumber-preprocessor/steps'
import { EXTENDED_TIMEOUT } from '../../../support/utils'
import { dashboardTitleSel } from '../../../elements/viewDashboard'

// Scenario: Dashboard id is invalid
Given('I type an invalid dashboard id in the browser url', () => {
    cy.visit('#/invalid', EXTENDED_TIMEOUT)
})
Then('a message displays informing that the dashboard is not found', () => {
    cy.contains('Requested dashboard not found').should('be.visible')
    cy.get(dashboardTitleSel).should('not.exist')
})

//Scenario: edit Dashboard id is invalid
Given('I type an invalid edit dashboard id in the browser url', () => {
    cy.visit('#/invalid/edit', EXTENDED_TIMEOUT)
})

//Scenario: print Dashboard id is invalid
Given('I type an invalid print dashboard id in the browser url', () => {
    cy.visit('#/invalid/printoipp', EXTENDED_TIMEOUT)
})

//Scenario: print layout Dashboard id is invalid
Given('I type an invalid print layout dashboard id in the browser url', () => {
    cy.visit('#/invalid/printlayout', EXTENDED_TIMEOUT)
})
