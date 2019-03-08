Feature: Create a refuel register
 
  Scenario: Create a refuel register correctly
    When I press fab
    Then I see "Refueling"
    When I press "Refueling"
    Then I see "Add refueling"
    Then I enter text "12345" into field with id "edt_mileage"
    Then I enter text "45" into field with id "edt_volume"
    Then I enter text "55" into field with id "edt_price"
    Then I press view with id "menu_save"
    When I swipe left
    Then I press "BDD Test"
    Then I should see "12345km"
    Then I should see "35.00"
    Then I should see "55.00"

  Scenario: Create a refuel register with empty fields
    When I press fab
    Then I see "Refueling"
    When I press "Refueling"
    Then I see "Add refueling"
    When I press view with id "menu_save"
    Then I should see "Has to be greater 0"






