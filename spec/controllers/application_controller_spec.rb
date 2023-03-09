require 'rails_helper'

describe ApplicationController do
  shared_examples 'redirects and displays alert' do
    it 'redirects to root_path' do
      get :index
      expect(response).to redirect_to root_path
    end

    it 'displays a helpful message to the user' do
      get :index
      expect(flash[:error]).
        to include('Sorry, we are experiencing issues with search.')
    end
  end

  context 'when Faraday::ConnectionFailed is raised' do
    controller do
      def index
        raise Faraday::ConnectionFailed, nil, nil
      end
    end

    it_behaves_like 'redirects and displays alert'
  end

  context 'when Ohanakapa::ServiceUnavailable is raised' do
    controller do
      def index
        raise Ohanakapa::ServiceUnavailable, nil, nil
      end
    end

    it_behaves_like 'redirects and displays alert'
  end

  context 'when Ohanakapa::InternalServerError is raised' do
    controller do
      def index
        raise Ohanakapa::InternalServerError, nil, nil
      end
    end

    it_behaves_like 'redirects and displays alert'
  end

  context 'when Ohanakapa::NotFound is raised' do
    controller do
      def index
        raise Ohanakapa::NotFound, nil, nil
      end
    end

    it 'redirects to root_path' do
      get :index
      expect(response).to redirect_to root_path
    end

    it 'displays a helpful message to the user' do
      get :index
      expect(flash[:error]).
        to include('Sorry, that page does not exist. Please try a new search.')
    end

    it 'redirects to previous page if a referer exists' do
      request.env['HTTP_REFERER'] = 'http://localhost:3000/about'

      get :index

      expect(response).to redirect_to 'http://localhost:3000/about'
    end
  end

  context 'when Ohanakapa::BadRequest is raised' do
    controller do
      def index
        raise Ohanakapa::BadRequest, nil, nil
      end
    end

    it 'redirects to root_path' do
      get :index
      expect(response).to redirect_to root_path
    end

    it 'displays a helpful message to the user' do
      get :index
      expect(flash[:error]).
        to include('That search was improperly formatted. Please try a new search.')
    end

    it 'redirects to previous page if a referer exists' do
      request.env['HTTP_REFERER'] = 'http://localhost:3000/about'

      get :index

      expect(response).to redirect_to 'http://localhost:3000/about'
    end
  end
end
