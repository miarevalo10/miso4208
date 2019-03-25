Feature: Create an other expenditure register

  Scenario: Create an other expenditure correctly
    When I press fab
    Then I should see "Other expenditure"
    When I press "Other expenditure"
    Then I should see "Add other expenditure"
    Then I enter text "Expenditure BDD" into field with id "edt_title"
    Then I enter text "200" into field with id "edt_mileage"
    Then I enter text "666" into field with id "edt_price"
    Then I press view with id "menu_save"
    When I swipe left
    Then I wait to see "BDD Test"
    Then I press "BDD Test"
    Then I should see "Other Expenditures"
    Then I press "Other Expenditures"
    Then I should see "Expenditure BDD"
    Then I should see "200"
    Then I should see "666.00"
