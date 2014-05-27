require 'spec_helper'

# Checks for the search results summary
feature 'Search summary' do

  scenario 'when visiting search results page that has results', :vcr do
    search_for_maceo
    # Expect only static and floating search results summary,
    # and expect that they're only in the results-header.
    expect(all('.search-summary', :text=>'Displaying 1 result').count).to eq(2)
    expect(all('.results-header .search-summary', :text=>'Displaying 1 result').count).to eq(2)
  end

  scenario 'when visiting search results page that does not have results', :vcr do
    search_for_no_results
    # Expect only static and floating search results summary,
    # and expect that they're only in the results-header.
    expect(all('.search-summary', :text=>'No results').count).to eq(2)
    expect(all('.results-header .search-summary', :text=>'No results').count).to eq(2)
  end

end
