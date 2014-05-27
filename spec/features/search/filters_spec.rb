require 'spec_helper'

feature "results page search", :js=>true do

  background do
    page.set_rack_session('aggregate_locations' => [])
    search_from_home(:keyword=>"asdfg")
  end

  # test filter fieldset legend toggling across all filters
  scenario 'when location filter has no cached values and legend is toggled', :vcr do
    test_filter_legend("location")
  end
  scenario 'when service-area filter has no cached values and legend is toggled', :vcr do
    test_filter_legend("service-area","San Mateo County, CA")
  end
  scenario 'when kind filter has no cached values and legend is toggled', :vcr do
    test_filter_legend("kind", "Human Services",13)
  end
  scenario 'when agency filter has no cached values and legend is toggled', :vcr do
    test_filter_legend("org-name")
  end

  # test filter fieldset toggle toggling across all filters
  scenario 'when location filter has no cached values and toggle is toggled', :vcr do
    test_filter_toggle("location")
  end
  scenario 'when service-area filter has no cached values and toggle is toggled', :vcr do
    test_filter_toggle("service-area","San Mateo County, CA")
  end
  scenario 'when kind filter has no cached values and toggle is toggled', :vcr do
    test_filter_toggle("kind", "Human Services",13)
  end
  scenario 'when agency filter has no cached values and toggle is toggled', :vcr do
    test_filter_toggle("org-name")
  end

  # test adding custom value to filters that accept custom values
  scenario 'when location filter has no cached values and custom value is added', :vcr do
    fill_filter_custom_field("location","Custom Value")
    expect(all("#location-options .current-option label").last).to have_content("Custom Value")
  end
  scenario 'when agency filter has no cached values and custom value is added', :vcr do
    fill_filter_custom_field("org-name","Custom Value")
    expect(all("#org-name-options .current-option label").last).to have_content("Custom Value")
  end

  # test adding custom value to filters and retrieving no results
  scenario 'when location filter has custom value and no results', :vcr do
    test_filter_custom_value_no_results("location","San Mateo, CA")
  end
  scenario 'when agency filter has custom value and no results', :vcr do
    test_filter_custom_value_no_results("org-name","United States Government")
  end

  # test adding custom value to filters and retrieving results
  scenario 'when location filter has custom value and has results', :vcr do
    name = "location"
    field = "San Mateo, CA"
    set_filter(name,field)
    fill_in('keyword', :with => '') # clear keyword

    find('#find-btn').click

    find(".require-loaded")
    within("##{name}-options") do
      find(".closed").click
      expect(page).to have_selector(".open")
      expect(find(".available-options")).to have_css(".toggle-group", :count=>3)
      expect(page).not_to have_css("##{name}-option-input")
    end
  end
  scenario 'when agency filter has custom value and has results', :vcr do
    name = "org-name"
    field = "United States Government"
    set_filter(name,field)
    fill_in('keyword', :with => '') # clear keyword

    find('#find-btn').click

    find(".require-loaded")
    within("##{name}-options") do
      find(".closed").click
      expect(page).to have_selector(".open")
      expect(find(".available-options")).to have_css(".toggle-group", :count=>3)
      expect(page).not_to have_css("##{name}-option-input")
    end
  end

  # test filter selection across all filters
  scenario 'when location filter has cached values and new option is selected', :vcr do
    fill_in('keyword', :with => '') # clear keyword
    find('#find-btn').click
    expect(page).to have_content("589 results")
    set_filter("location","San Mateo, CA",false)
    find('#find-btn').click
    expect(page).to have_content("129 results")
    expect(all("#location-options .current-option label").last).to have_content("San Mateo, CA")
  end
  scenario 'when service-area filter has cached values and new option is selected', :vcr do
    fill_in('keyword', :with => '') # clear keyword
    find('#find-btn').click
    expect(page).to have_content("589 results")
    set_filter("service-area","All",false)
    find('#find-btn').click
    expect(page).to have_content("678 results")
    expect(all("#service-area-options .current-option label").last).to have_content("All")
  end
  scenario 'when kind filter has cached values and new option is selected', :vcr do
    fill_in('keyword', :with => '') # clear keyword
    find('#find-btn').click
    expect(page).to have_content("589 results")
    set_filter("kind","Other",false)
    find('#find-btn').click
    expect(page).to have_content("521 results")
    expect(all("#kind-options .current-option label").last).to have_content("Other")
  end
  scenario 'when agency filter has cached values and new option is selected', :vcr do
    fill_in('keyword', :with => '') # clear keyword
    find('#find-btn').click
    expect(page).to have_content("589 results")
    set_filter("org-name","San Mateo County Human Services Agency",false)
    find('#find-btn').click
    expect(page).to have_content("11 results")
    expect(all("#org-name-options .current-option label").last).to have_content("San Mateo County Human Services Agency")
  end


  # user clicks filter links in results list
  scenario 'when clicking organization link in results', :vcr do
    search(:keyword => "St. Vincent de Paul Society")
    expect(page).to have_content("St. Vincent de Paul Society")
    first("#list-view li").click_link("St. Vincent de Paul Society")
    expect(page).not_to have_content("Shelter Network")
    expect(page).to have_content("San Mateo Homeless Help Center")

    # check filter settings
    expect(all("#location-options .current-option label").last).to have_content("All")
    expect(all("#service-area-options .current-option label").last).to have_content("All")
    expect(all("#kind-options .current-option label").last).to have_content("All")
    expect(all("#org-name-options .current-option label").last).to have_content("St. Vincent de Paul Society")
  end

  scenario 'when clicking kind link in results', :vcr do
    search(:keyword => "St. Vincent de Paul Society")
    expect(page).to have_content("St. Vincent de Paul Society")
    first("#list-view li").click_link("Human Services")
    expect(page).not_to have_content("Shelter Network")
    expect(page).to have_content("San Mateo County Human Services Agency")

    # check filter settings
    expect(all("#location-options .current-option label").last).to have_content("All")
    expect(all("#service-area-options .current-option label").last).to have_content("All")
    expect(all("#kind-options .current-option label").last).to have_content("Human Services")
    expect(all("#org-name-options .current-option label").last).to have_content("All")
  end

  scenario 'when clicking the reset button', :vcr do
    expect(page).to have_content("No results")
    find(".reset-btn").click

    # check filter settings
    expect(find_field("keyword").value).to eq ""
    expect(all("#location-options .current-option label").last).to have_content("All")
    expect(all("#service-area-options .current-option label").last).to have_content("All")
    expect(all("#kind-options .current-option label").last).to have_content("All")
    expect(all("#org-name-options .current-option label").last).to have_content("All")

    find('#find-btn').click
    expect(page).to have_content("1709 results")
  end

end