Feature: Create a refuel register

  @current
  Scenario: Create a refuel register
    When I press view with id "fab"
    Then I see "Refueling"
    When I press "Refueling"
    Then I see "Add refueling"

