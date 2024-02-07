source 'https://rubygems.org'

ruby File.read('.ruby-version').strip
gem 'actionmailer', '~> 6.1.5'
gem 'faraday', '~> 0.8'
gem 'faraday-http-cache', '~> 2.0'
gem 'figaro'
gem 'font-awesome-rails'
gem 'haml-rails'
gem 'kaminari-actionview', '~> 1.2.2'
gem 'kaminari-core', git: 'https://github.com/monfresh/kaminari.git', branch: 'mb-fix-total-count-1013y'
gem 'mail', '~> 2.8.0.rc1'
gem 'ohanakapa', '~> 1.1.1'
gem 'puma'
gem 'rack-cache', '~> 1.13'
gem 'rack-rewrite', '~> 1.5.0'
gem 'railties', '~> 6.1.5'
gem 'recaptcha'
gem 'redis-rack-cache', git: 'https://github.com/monfresh/redis-rack-cache.git', branch: 'readthis-compatibility'
gem 'sassc-rails', '~> 2.1'
gem 'skylight'
gem 'sorted_set', '~> 1.0.3'
gem 'sprockets', '~> 3.7.1'
gem 'uglifier'
gem 'webpacker', '~> 5.2'

# dev and debugging tools
group :development do
  gem 'better_errors', '~> 2.9.1'
  gem 'bummr'
  gem 'derailed'
  gem 'flamegraph'
  gem 'letter_opener'
  gem 'rack-mini-profiler', require: false
  gem 'reek'
  gem 'stackprof'
  gem 'yard'
end

group :test do
  gem 'capybara'
  gem 'email_spec'
  gem 'haml_lint'
  gem 'rails-controller-testing'
  gem 'rubocop'
  gem 'rubocop-rails'
  gem 'selenium-webdriver'
  gem 'simplecov', '=0.17.1', require: false
  gem 'vcr'
  gem 'webmock', '~> 3.4'
end

group :development, :test do
  gem 'rspec-rails', '~> 5.1'
end
