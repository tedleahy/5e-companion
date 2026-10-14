ENV["RAILS_ENV"] ||= "test"
# The CORS and host rules trust one tailnet's MagicDNS names. Tests pin a made-up
# tailnet, so they don't depend on the tailnet of whoever runs them.
ENV["TAILNET_DOMAIN"] = "tail1234.ts.net"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    # Run tests in parallel with specified workers
    parallelize(workers: :number_of_processors)

    # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
    fixtures :all

    # Add more helper methods to be used by all tests here...
  end
end
