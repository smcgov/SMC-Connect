module Jsbundling
  module Tasks
    extend self

    def build_command
      "node_modules/.bin/webpack --config webpack.config.js"
    end
  end
end
