require "test_helper"

class CorsTest < ActionDispatch::IntegrationTest
  ALLOWED = [
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "http://100.101.102.103:8081",
    "http://laptop.tail1234.ts.net:8081",
    "https://laptop.tail1234.ts.net",
    "http://#{Tailscale::HOST_NAME}:8081",
  ].freeze

  REJECTED = [
    "http://#{Tailscale::HOST_NAME}-other:8081",
    "https://#{Tailscale::HOST_NAME}:8081",
    "http://192.168.1.20:8081",
    "https://example.com",
    "https://100.101.102.103:8081",
    "http://100.63.255.255:8081",
    "http://100.128.0.1:8081",
    "http://ts.net.example.com",
  ].freeze

  test "allows local and Tailscale origins" do
    ALLOWED.each do |origin|
      get api_v1_characters_url, headers: { "Origin" => origin }

      assert_equal origin, response.headers["Access-Control-Allow-Origin"], origin
    end
  end

  test "allows the bearer token header in a preflight" do
    options api_v1_characters_url, headers: {
      "Origin" => "http://100.101.102.103:8081",
      "Access-Control-Request-Method" => "GET",
      "Access-Control-Request-Headers" => "authorization",
    }

    assert_match(/authorization/i, response.headers["Access-Control-Allow-Headers"])
  end

  test "rejects LAN, public and non-Tailscale origins" do
    REJECTED.each do |origin|
      get api_v1_characters_url, headers: { "Origin" => origin }

      assert_nil response.headers["Access-Control-Allow-Origin"], origin
    end
  end
end
