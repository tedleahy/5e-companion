require "test_helper"
require Rails.root.join("config/tailscale")

# Development adds Tailscale::MAGIC_DNS_NAME and Tailscale::HOST_NAME to
# config.hosts. The test environment allows every host, so this runs them
# through Rails's host check directly.
class TailscaleHostsTest < ActiveSupport::TestCase
  setup do
    app = ->(_env) { [ 200, {}, [ "ok" ] ] }
    @hosts = ActionDispatch::HostAuthorization.new(
      app, [ Tailscale::MAGIC_DNS_NAME, Tailscale::HOST_NAME ]
    )
  end

  test "allows MagicDNS names with or without a port" do
    [ "laptop.tail1234.ts.net", "laptop.tail1234.ts.net:3000" ].each do |host|
      assert_equal 200, status_for(host), host
    end
  end

  test "allows this computer's short name with or without a port" do
    [ Tailscale::HOST_NAME, "#{Tailscale::HOST_NAME}:3000" ].each do |host|
      assert_equal 200, status_for(host), host
    end
  end

  test "blocks the bare domain and look-alikes" do
    [
      "ts.net",
      "laptop.tail1234.ts.net.example.com",
      "laptop.tail1234-ts.net",
      "#{Tailscale::HOST_NAME}-other",
    ].each do |host|
      assert_equal 403, status_for(host), host
    end
  end

  private
    def status_for(host)
      @hosts.call(Rack::MockRequest.env_for("/", "HTTP_HOST" => host)).first
    end
end
