var faker = require('faker/locale/es_MX')

//var appUrl = 'http://ec2-3-87-196-16.compute-1.amazonaws.com/index.php/admin/index';
var appUrl = 'http://ec2-3-87-196-16.compute-1.amazonaws.com/index.php/admin/authentication/sa/login';
const SEP_RANDOM = ":"
const RANDOM = "random" + SEP_RANDOM
const mapFaker = {
  'usuario': 'internet.userName',
  'password': 'internet.password',
  'email': 'internet.email',
  'titulo': 'lorem.words',
  'descripcion': 'lorem.sentence',
}
var seed = 1234;

beforeEach(() => {
  faker.seed(seed++);

  Given(`I go to administration login`, () => {
    cy.visit(appUrl)
  })

  Given(`I go to administration panel`, () => {
    cy.visit(appUrl)
    loginAdministrador()
  })
})

When(`I fill {string} with {string}`, (id, value) => {
  cy.get('input[id="' + id + '"]').click().type(getValue(value))
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

function getValue(value) {
  if (value.startsWith(RANDOM)) {
    let res = value.split(SEP_RANDOM);
    return index(faker, mapFaker[res[1]])();
  } else {
    return value;
  }
}

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

// Tomado de https://stackoverflow.com/questions/6393943/convert-javascript-string-in-dot-notation-into-an-object-reference
function index(obj,is, value) {
  if (typeof is == 'string')
      return index(obj,is.split('.'), value);
  else if (is.length==1 && value!==undefined)
      return obj[is[0]] = value;
  else if (is.length==0)
      return obj;
  else
      return index(obj[is[0]],is.slice(1), value);
}