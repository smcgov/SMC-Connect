require "spec_helper"

describe "Home page header elements" do

  before(:each) do
    visit "/"
  end

  it 'includes correct title' do
    expect(page).to have_title "SMC-Connect"
  end

  it 'includes utility links' do
    expect(page).to have_content "About"
    expect(page).to have_content "Contribute"
    expect(page).to have_content "Feedback"
  end

end

describe "Home page content elements" do

  before(:each) do
    visit "/"
  end

  it 'includes english language status' do
    expect(find("#language-box")).to have_content("English")
  end

  it 'includes general-services category links' do
    within("#general-services") do
      expect(page).to have_content "government assistance"
    end
  end

  it 'includes emergency-services category links' do
    within("#emergency-services") do
      expect(page).to have_content "reporting"
    end
  end

end

describe "Home page footer elements" do

  before(:each) do
    visit "/"
  end

  it "includes a link to ohanapi.org" do
    within("#app-footer") do
      expect(find_link('view project details')[:href]).to eq('http://ohanapi.org')
    end
  end

  it "includes a link to codeforamerica.org" do
    within("#app-footer") do
      expect(find_link('Code for America')[:href]).to eq('http://codeforamerica.org')
    end
  end

  it "includes a link to the ohana-web-search GitHub repo" do
    within("#app-footer") do
      expect(find_link('Get this app')[:href]).
        to eq('https://github.com/codeforamerica/ohana-web-search')
    end
  end
end