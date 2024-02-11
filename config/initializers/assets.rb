# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.4'

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )

# Propshaft includes all stylesheets in public/assets when only application.css is needed
# https://github.com/rails/propshaft/issues/89
Rails.application.config.assets.excluded_paths << File.join(Rails.root, 'app/assets/stylesheets')
