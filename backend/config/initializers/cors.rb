# Be sure to restart your server when you modify this file.

# Lets the Expo web build read the API from a browser on this computer, or from
# a phone's browser over Tailscale. Expo Go's native fetch ignores CORS.
#
# Local environments only: the test environment loads the same rules so they
# can be tested. Production allows no origin; that belongs with deployment.
#
# Read more: https://github.com/cyu/rack-cors
if Rails.env.local?
  require_relative "../tailscale"

  # Nil when the tailnet's domain is unknown, which refuses every MagicDNS name.
  magic_dns_name = (/\A#{Tailscale::MAGIC_DNS_NAME}\z/ if Tailscale::MAGIC_DNS_NAME)

  # Origins are allowed on any port:
  # - http://localhost and http://127.0.0.1
  # - http on a Tailscale address, 100.64.0.0/10
  # - http or https on a MagicDNS name on this tailnet, such as
  #   laptop.tail1234.ts.net. Other tailnets' names are refused, because
  #   Funnel can publish them on the public internet.
  # - http on this computer's short MagicDNS name, where Metro serves the app
  allowed_origin = lambda do |origin, _env|
    uri = URI.parse(origin)
    host = uri.host.to_s.downcase
    magic_dns = magic_dns_name&.match?(host) || false

    case uri.scheme
    when "http"
      next true if magic_dns || [ "localhost", "127.0.0.1", Tailscale::HOST_NAME ].include?(host)

      begin
        Tailscale::ADDRESSES.include?(IPAddr.new(host))
      rescue IPAddr::Error
        false
      end
    when "https"
      magic_dns
    else
      false
    end
  rescue URI::InvalidURIError
    false
  end

  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins allowed_origin

      resource "/api/*", headers: %w[Authorization], methods: %i[get]
    end
  end
end
