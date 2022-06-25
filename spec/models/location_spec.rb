require 'rails_helper'

describe Location do
  describe '.search' do
    it 'returns results', :vcr do
      expect { Location.search(kind: 'Parks') }.to_not raise_error
    end
  end
end
