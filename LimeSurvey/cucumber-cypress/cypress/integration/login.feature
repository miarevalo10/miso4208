#language: en

@e2e
Feature: Login into administration panel

Scenario: Login is correct
    Given I go to administration login
    When I fill "user" with "admin"
    When I fill "password" with "admin"
    When I press button name "login_submit"
    Then I see the message "Esta es la interface de administración de LimeSurvey"

Scenario: Login failed {3}
    Given I go to administration login
    When I fill "user" with "random:usuario"
    When I fill "password" with "random:password"
    When I press button name "login_submit"
    Then I see the message "¡Nombre de usuario y/o contraseña incorrecta!"