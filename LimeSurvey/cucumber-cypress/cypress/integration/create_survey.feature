@e2e
Feature: Create a survey

Scenario: Create a survey
    Given I go to administration panel
    When I press button "panel-1"
    When I fill "surveyls_title" with "Encuesta Pruebas E2E"
    When I press button "save-form-button"
    Then I expect to see survey details