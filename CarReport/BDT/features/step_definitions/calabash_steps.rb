require 'calabash-android/calabash_steps'
Given /^I clear app data$/ do
    clear_app_data
   end

When /^I press fab$/ do
    touch("* id:'fab' ImageView")
   end
