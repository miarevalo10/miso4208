Feature: Create a car

  @reset @current
  Scenario: Create a car with empty fields
     When I press view with id "btn_create_car"
     Then I see "ADD CAR"
     When I press view with id "menu_save"
     Then I see "Must not be empty"

  @reset @current
  Scenario: Create a car succesfully
    When I press "Create a car"
    Then I see "ADD CAR"
    Then I enter text "BDD Test" into field with id "edt_name"
    Then I enter text "666" into field with id "edt_initial_mileage"
    When I press view with id "menu_save"
    Then I see "Reports" 
