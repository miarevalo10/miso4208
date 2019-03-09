var appUrl = 'http://localhost:8888/index.php/admin/index';

function login(user, password) {
  cy.visit(appUrl)

  cy.get('.login-content-form').find('input[name="user"]').click().type(user)
  cy.get('.login-content-form').find('input[name="password"]').click().type(password)
  cy.get('button[name="login_submit"]').click()
}

function loginAdministrador() {
  login("admin", "admin")
}

function buscarEncuesta(encuesta) {
  cy.get('.selector__list_surveys').click()
  cy.get('input[id="Survey_searched_value"]').click().type(encuesta)
  cy.get('#surveys').find('input[name="yt0"]').click()
}

beforeEach(() => {
  Given(`I go to administration login`, () => {
    cy.visit(appUrl)
  })

  Given(`I go to administration panel`, () => {
    cy.visit(appUrl)
    loginAdministrador()
  })
})

When(`I fill {string} with {string}`, (id, value) => {
  cy.get('input[id="' + id + '"]').click().type(value)
})

When(`I press button name {string}`, name => {
  cy.get('button[name="' + name + '"]').click()
})

When(`I press button {string}`, id => {
  cy.get('#' + id).click()
})

When(`I press input name {string}`, name => {
  cy.get('input[name="' + name + '"]').click()
})

Then(`I see the message {string}`, message => {
  cy.contains(message)
})

Then(`I expect to see survey details`, () => {
  cy.url().should('contain', 'view/surveyid')
})

Then(`Search table shows {string}`, (register) => {
  cy.get('#surveys table').contains(register)
})


