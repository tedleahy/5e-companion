require "ipaddr"
require "json"
require "socket"

# Tailscale patterns shared by the development host allow-list and the
# development CORS origins. Kept outside lib/ so environment files can require
# it before autoloading starts.
module Tailscale
  # Every tailnet address falls in this range.
  ADDRESSES = IPAddr.new("100.64.0.0/10")

  # Finds this tailnet's MagicDNS domain, such as tail1234.ts.net.
  #
  # Only this tailnet's names are trusted. Any Tailscale user can publish a
  # .ts.net name on the public internet with Funnel, so trusting every .ts.net
  # name would let other people's pages call the API.
  #
  # @param env [Hash{String => String}] - Where to look for a TAILNET_DOMAIN
  #   override, which wins over the running Tailscale's answer.
  # @param lookup [#call] - Asks Tailscale for the domain when there's no
  #   override. Tests pass their own, so they never run the tailscale command.
  # @return [String, nil] the lowercase domain, or nil when it isn't set and
  #   Tailscale isn't installed, running or using MagicDNS.
  def self.find_domain(env = ENV, lookup: method(:magic_dns_suffix))
    domain = blank_to_nil(env["TAILNET_DOMAIN"]) || lookup.call
    domain&.downcase&.delete_suffix(".")
  end

  # Asks the running Tailscale for its MagicDNS suffix.
  #
  # @return [String, nil] the suffix, or nil when Tailscale can't say.
  def self.magic_dns_suffix
    status = IO.popen([ "tailscale", "status", "--json" ], err: File::NULL, &:read)
    blank_to_nil(JSON.parse(status)["MagicDNSSuffix"]) if $?.success?
  rescue SystemCallError, JSON::ParserError
    nil
  end

  # Plain Ruby rather than ActiveSupport's presence, so this file doesn't depend
  # on how much of Rails has loaded when it's required.
  def self.blank_to_nil(value)
    value = value.to_s.strip
    value unless value.empty?
  end
  private_class_method :blank_to_nil

  # Builds the pattern for a machine's full MagicDNS name on one tailnet.
  #
  # Unanchored, because Rails anchors host patterns itself and adds an
  # optional port.
  #
  # @param domain [String, nil] - The tailnet's MagicDNS domain.
  # @return [Regexp, nil] a pattern matching one machine name under the
  #   domain, such as laptop.tail1234.ts.net, or nil without a domain.
  def self.magic_dns_name(domain)
    /[a-z0-9-]+\.#{Regexp.escape(domain)}/i if domain
  end

  # This tailnet's MagicDNS domain. Nil turns off MagicDNS names, though
  # Tailscale addresses still work.
  DOMAIN = find_domain

  # A full MagicDNS name on this tailnet, or nil when DOMAIN is unknown.
  MAGIC_DNS_NAME = magic_dns_name(DOMAIN)

  # This computer's short name, such as laptop. MagicDNS answers to a machine's
  # name without the tailnet domain too. Tailscale names a machine after its
  # host name, so this misses only a machine renamed in the admin console.
  HOST_NAME = Socket.gethostname.split(".").first.downcase
end
