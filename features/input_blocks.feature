Feature: Input Blocks
  As a user of Zazu
  I want to use all the available block types
  So I can be more productive

  Scenario: Root Script
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    And I type in "tinytacoteam"
    Then the search window is visible
    And I have 1 result
    And the results contains "tinytacoteam"

  Scenario: Prefix Script
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    And I type in "food cookie"
    Then the search window is visible
    And I have 2 results

  Scenario: Keyword
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I toggle with the hotkey
    And I type in "eggtimer"
    Then the search window is visible
    And I have 1 result
    And the results contains "Start eggtimer"

  Scenario: Hotkey to an input
    Given I have "tinytacoteam/zazu-fixture" as a plugin
    And the app is launched
    When I hit the hotkey "alt+f"
    And I type in "cookie"
    Then the search window is visible
    And I have 2 results
