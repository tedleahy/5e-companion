require "ipaddr"
require "socket"

# Tailscale patterns shared by the development host allow-list and the
# development CORS origins. Kept outside lib/ so environment files can require
# it before autoloading starts.
module Tailscale
  # Every tailnet address falls in this range.
  ADDRESSES = IPAddr.new("100.64.0.0/10")

  # A MagicDNS name, such as laptop.tail1234.ts.net. Unanchored, because Rails
  # anchors host patterns itself and adds an optional port. The string ".ts.net"
  # would match only one subdomain label, and MagicDNS names have two.
  MAGIC_DNS_NAME = /(?:[a-z0-9-]+\.)+ts\.net/i

  # This computer's short name, such as laptop. MagicDNS answers to a machine's
  # name without the tailnet domain too. Tailscale names a machine after its
  # host name, so this misses only a machine renamed in the admin console.
  HOST_NAME = Socket.gethostname.split(".").first.downcase
end
