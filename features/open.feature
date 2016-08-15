Feature: Open
  As a user of Zazu
  I want to open the app
  So I can be more productive

  Scenario: Toggle open Zazu
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    Then the search window is visible

  Scenario: Toggle close Zazu
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    And I toggle with the hotkey
    Then the search window is not visible

  Scenario: Escape to close Zazu
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    And I hit the key "escape"
    Then the search window is not visible
