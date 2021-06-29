import { When, Then } from 'cypress-cucumber-preprocessor/steps'
import { EXTENDED_TIMEOUT } from '../../../support/utils'
import { dashboardTitleSel } from '../../../elements/viewDashboard'
import { getSharingDialogUserSearch } from '../../../elements/sharingDialog'

const USER_NAME = 'Kevin Boateng'

When('I change sharing settings', () => {
    cy.get('button').contains('Share', EXTENDED_TIMEOUT).click()

    //confirm that Boateng is not currently listed
    cy.get('hr').should('have.length', 3)

    getSharingDialogUserSearch().type('Boateng')
    cy.contains(USER_NAME).click()

    cy.get('div').contains(USER_NAME).should('be.visible')

    cy.get('button').contains('close', { matchCase: false }).click()
})

Then('the new sharing settings should be preserved', () => {
    cy.visit('/')
    cy.get(dashboardTitleSel, EXTENDED_TIMEOUT).should('be.visible')
    cy.get('button').contains('Share', EXTENDED_TIMEOUT).should('be.visible')
    cy.get('button').contains('Share', EXTENDED_TIMEOUT).click()

    cy.get('hr').should('have.length', 4)
    cy.get('div').contains(USER_NAME, EXTENDED_TIMEOUT).should('be.visible')
})
