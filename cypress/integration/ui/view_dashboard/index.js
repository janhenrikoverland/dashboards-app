import { Given, When, Then } from 'cypress-cucumber-preprocessor/steps'

// const antenatalCareDashboardRoute = '#/nghVC4wtyzi'
// const immunizationDashboardRoute = '#/TAMlzYkstb7'
const immunizationDashboardRoute = '#/kGuKXoR8lL8'
const antenatalCareDashboardRoute = '#/Tb8kBFjsk2B'

const tenSecTimeout = { timeout: 10000 }

Given('I open the Antenatal Care dashboard', () => {
    cy.visit(antenatalCareDashboardRoute)
})

Then('the Antenatal Care dashboard displays in view mode', () => {
    // cy.wait(10000)
    cy.location().should(loc => {
        expect(loc.hash).to.equal(antenatalCareDashboardRoute)
    })

    cy.get('[data-test="dhis2-dashboard-view-dashboard-title"]', tenSecTimeout)
        .should('be.visible')
        .and('contain', 'Antenatal Care')
    // cy.get('.highcharts-background', tenSecTimeout).should('exist')
})

When('I select the Immunization dashboard', () => {
    cy.get('[data-test="dhis2-uicore-chip"]', tenSecTimeout)
        .contains('Immunization mini')
        .click()
})

Then('the Immunization dashboard displays in view mode', () => {
    cy.location().should(loc => {
        expect(loc.hash).to.equal(immunizationDashboardRoute)
    })

    cy.get('[data-test="dhis2-dashboard-view-dashboard-title"]', tenSecTimeout)
        .should('be.visible')
        .and('contain', 'Immunization')
    // cy.get('.highcharts-background', tenSecTimeout).should('exist')
})

When('I search for dashboards containing Immunization', () => {
    cy.get(
        '[data-test="dhis2-dashboard-search-dashboard-input"]',
        tenSecTimeout
    ).type('Immunization mini')
})

Then('Immunization and Immunization data dashboards are choices', () => {
    cy.get('[data-test="dhis2-uicore-chip"]', tenSecTimeout)
        .should('be.visible')
        .and('have.length', 1)
})

When('I press enter in the search dashboard field', () => {
    cy.get(
        '[data-test="dhis2-dashboard-search-dashboard-input"]',
        tenSecTimeout
    ).type('{enter}')
})

When('I click to preview the print layout', () => {
    cy.get('[data-test="dhis2-dashboard-more-button"]', tenSecTimeout).click()
    cy.get(
        '[data-test="dhis2-dashboard-print-menu-item"]',
        tenSecTimeout
    ).click()
    cy.get(
        '[data-test="dhis2-dashboard-print-layout-menu-item"]',
        tenSecTimeout
    ).click()
})

Then('the print layout displays', () => {
    //check the url
    cy.location().should(loc => {
        expect(loc.hash).to.equal(`${antenatalCareDashboardRoute}/printlayout`)
    })

    //check for some elements
    cy.get(
        '[data-test="dhis2-dashboard-print-layout-page"]',
        tenSecTimeout
    ).should('exist')
})

When('I click to exit print preview', () => {
    cy.get(
        '[data-test="dhis2-dashboard-exit-print-preview"]',
        tenSecTimeout
    ).click()
})

When('I click to preview the print one-item-per-page', () => {
    cy.get('[data-test="dhis2-dashboard-more-button"]', tenSecTimeout).click()
    cy.get(
        '[data-test="dhis2-dashboard-print-menu-item"]',
        tenSecTimeout
    ).click()
    cy.get(
        '[data-test="dhis2-dashboard-print-oipp-menu-item"]',
        tenSecTimeout
    ).click()
})

Then('the print one-item-per-page displays', () => {
    //check the url
    cy.location().should(loc => {
        expect(loc.hash).to.equal(`${antenatalCareDashboardRoute}/printoipp`)
    })

    //check for some elements
    cy.get(
        '[data-test="dhis2-dashboard-print-oipp-page"]',
        tenSecTimeout
    ).should('exist')
})
