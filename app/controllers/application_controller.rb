class ApplicationController < ActionController::Base
  unless Rails.application.config.consider_all_requests_local
    rescue_from Faraday::ConnectionFailed, with: :render_api_down
    rescue_from Ohanakapa::ServiceUnavailable, with: :render_api_down
    rescue_from Ohanakapa::InternalServerError, with: :render_api_down
    rescue_from Ohanakapa::BadRequest, with: :render_bad_search
    rescue_from Ohanakapa::NotFound, with: :render_not_found
  end

  add_flash_types :error

  private

  def render_api_down
    redirect_to root_path, error: t('errors.api_down')
  end

  def render_bad_search
    redirect_back(fallback_location: root_path, error: t('errors.bad_search'))
  end

  def render_not_found
    redirect_back(fallback_location: root_path, error: t('errors.not_found'))
  end
end
