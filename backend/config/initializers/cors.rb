# Be sure to restart your server when you modify this file.

# Lets the Expo web build read the API from a browser on this computer, or from
# a phone's browser over Tailscale. Expo Go's native fetch ignores CORS.
#
# Local environments only: the test environment loads the same rules so they
# can be tested. Production allows no origin; that belongs with deployment.
#
# Read more: https://github.com/cyu/rack-cors
if Rails.env.local?
  tailscale_addresses = IPAddr.new("100.64.0.0/10")

  # Origins are allowed on any port:
  # - http://localhost and http://127.0.0.1
  # - http on a Tailscale address, 100.64.0.0/10
  # - http or https on a Tailscale MagicDNS name, ending in .ts.net
  allowed_origin = lambda do |origin, _env|
    uri = URI.parse(origin)
    host = uri.host.to_s.downcase
    magic_dns = host.end_with?(".ts.net")

    case uri.scheme
    when "http"
      next true if magic_dns || %w[localhost 127.0.0.1].include?(host)

      begin
        tailscale_addresses.include?(IPAddr.new(host))
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
