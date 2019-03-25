@e2e
Feature: Search a survey

Scenario: Search a survey with results
    Given I go to administration panel
    When I press button "panel-2"
    When I fill "Survey_searched_value" with "Encuesta Pruebas E2E"
    When I press input name "yt0"
    Then Search table shows "Encuesta Pruebas E2E"

Scenario: Search a survey without results
    Given I go to administration panel
    When I press button "panel-2"
    When I fill "Survey_searched_value" with "random:titulo"
    When I press input name "yt0"
    Then Search table shows "Ninguna encuesta encontrada"