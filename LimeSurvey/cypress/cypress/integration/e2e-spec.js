var appUrl = 'http://localhost:8888/index.php/admin/index';
var nombreEncuesta = 'Encuesta Pruebas E2E'
var nombreGrupo = "Grupo 1"

function login(user, password){
    cy.visit(appUrl)
        
    cy.get('.login-content-form').find('input[name="user"]').click().type(user)
    cy.get('.login-content-form').find('input[name="password"]').click().type(password)
    cy.get('button[name="login_submit"]').click()
}

function loginAdministrador(){
    login("admin", "admin")
}

function buscarEncuesta(encuesta){
    cy.get('.selector__list_surveys').click()
    cy.get('input[id="Survey_searched_value"]').click().type(encuesta)
    cy.get('#surveys').find('input[name="yt0"]').click()
}

describe('Autenticación administrador', function() {
    it('Autenticación exitosa', function() {
        loginAdministrador();
        cy.contains("Esta es la interfaz de administración de LimeSurvey. Comience a elaborar su encuesta aquí.")
    })

    it('Autenticación fallida', function() {
        login("admin", "1234");
        cy.contains("¡Nombre de usuario y/o contraseña incorrectos!")
    })
})

describe('Creación de encuesta', function() {
    it('Creación exitosa', function() {
        loginAdministrador()
        cy.get('.selector__create_survey').click()
        cy.get('input[id="surveyls_title"]').click().type(nombreEncuesta);
        cy.get('a[id="save-form-button"]').click()
        cy.url().should('contain','view/surveyid')        
    })
})

describe('Búsqueda de una encuesta', function() {
    it('Búsqueda con resultados', function() {
        loginAdministrador()
        buscarEncuesta(nombreEncuesta)
        cy.get('#surveys table a').contains(nombreEncuesta)
    })

    it('Búsqueda sin resultados', function() {
        let encuesta = 'Encuesta 12349kasjdlfkajdflkjadlfkjadfl'
        loginAdministrador()
        buscarEncuesta(encuesta)
        cy.get('#surveys table').contains('Ninguna encuesta encontrada')
    })
})

describe('Creación de grupo de preguntas', function() {
    it('Creación de grupo exitosa', function() {
        loginAdministrador()
        buscarEncuesta(nombreEncuesta)
        cy.get('#surveys table a').contains(nombreEncuesta).click()

        cy.get('button[id="adminpanel__sidebar--selectorStructureButton"]').click()
        cy.get('a[id="adminpanel__sidebar--selectorCreateQuestionGroup"]').click()
        cy.get('input[id="group_name_es"]').click().type(nombreGrupo)
        cy.get('a[id="save-button"]').click()
    })
})

describe('Creación de pregunta', function() {
    it('Creación exitosa', function() {
        loginAdministrador()
        buscarEncuesta(nombreEncuesta)
        cy.get('#surveys table a').contains(nombreEncuesta).click()

        cy.get('button[id="adminpanel__sidebar--selectorStructureButton"]').click()
        cy.get('a[id="adminpanel__sidebar--selectorCreateQuestion"]').click({force: true})
        cy.get('input[id="title"]').click().type("PREG1")
        cy.get('a[id="save-button"]').click()
    })

    it('Validación de obligatoriedad de código', function() {
        loginAdministrador()
        buscarEncuesta(nombreEncuesta)
        cy.get('#surveys table a').contains(nombreEncuesta).click()

        cy.get('button[id="adminpanel__sidebar--selectorStructureButton"]').click()
        cy.get('a[id="adminpanel__sidebar--selectorCreateQuestion"]').click({force: true})
        cy.get('a[id="save-button"]').click()
        cy.get('#edit-question-body').contains('El código de la pregunta no puede estar vacío')       
    })
})

describe('Eliminar encuesta', function() {
    it('Eliminación exitosa', function() {
        loginAdministrador()
        buscarEncuesta(nombreEncuesta)
        cy.get('#surveys table a').contains(nombreEncuesta).click()

        cy.get('button[id="ls-tools-button"]').click({force: true})
        cy.get('.fa-trash').click()
        cy.get('.jumbotron input').contains('Eliminar encuesta').click({force: true})
        cy.url().should('contain','admin/index')        
    })
})