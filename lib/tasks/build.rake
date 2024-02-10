module Jsbundling
  module Tasks
    module_function

    def build_command
      'node_modules/.bin/webpack --config webpack.config.js'
    end
  end
end
