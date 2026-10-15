require "test_helper"
require Rails.root.join("config/tailscale")

class TailscaleTest < ActiveSupport::TestCase
  NO_LOOKUP = -> { flunk "should not ask Tailscale when TAILNET_DOMAIN is set" }

  test "TAILNET_DOMAIN wins over asking Tailscale" do
    domain = Tailscale.find_domain({ "TAILNET_DOMAIN" => "tail1234.ts.net" }, lookup: NO_LOOKUP)

    assert_equal "tail1234.ts.net", domain
  end

  test "asks Tailscale when TAILNET_DOMAIN is unset or blank" do
    [ {}, { "TAILNET_DOMAIN" => "  " } ].each do |env|
      assert_equal "tail5678.ts.net", Tailscale.find_domain(env, lookup: -> { "tail5678.ts.net" }), env
    end
  end

  test "lowercases the domain and drops a DNS root dot" do
    domain = Tailscale.find_domain({ "TAILNET_DOMAIN" => "Tail1234.TS.net." }, lookup: NO_LOOKUP)

    assert_equal "tail1234.ts.net", domain
  end

  test "has no domain when Tailscale can't say" do
    assert_nil Tailscale.find_domain({}, lookup: -> { nil })
  end

  test "matches one machine name on the tailnet, and nothing without a domain" do
    pattern = /\A#{Tailscale.magic_dns_name("tail1234.ts.net")}\z/

    assert_match pattern, "laptop.tail1234.ts.net"

    assert_no_match pattern, "laptop.tail9999.ts.net"

    assert_no_match pattern, "evil.laptop.tail1234.ts.net"

    assert_no_match pattern, "laptop.tail1234xts.net"

    assert_nil Tailscale.magic_dns_name(nil)
  end

  test "uses the tailnet that test_helper.rb pins" do
    assert_equal "tail1234.ts.net", Tailscale::DOMAIN
  end
end
