#language: en

@e2e
Feature: Login into administration panel

Scenario: Login is correct
    Given I go to administration login
    When I fill "user" with "admin"
    When I fill "password" with "admin"
    When I press button name "login_submit"
    Then I see the message "Esta es la interfaz de administración de LimeSurvey"

Scenario: Login failed
    Given I go to administration login
    When I fill "user" with "admin"
    When I fill "password" with "1234"
    When I press button name "login_submit"
    Then I see the message "¡Nombre de usuario y/o contraseña incorrectos!"