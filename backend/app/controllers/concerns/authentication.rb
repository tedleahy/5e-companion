require "digest"

module Authentication
  extend ActiveSupport::Concern

  included do
    before_action :authenticate
  end

  private

  def authenticate
    token_pattern = /
      \A                         # start of string
      Bearer [ ]+                # 'Bearer', followed by 1+ spaces
      ([A-Za-z0-9\-._~+\/]+=*)   # the actual token characters
      \z                         # end of string
    /ix

    token = request.headers["Authorization"]
      &.match(token_pattern)
      &.captures
      &.first

    session = Session.find_by(token_digest: Digest::SHA256.hexdigest(token)) if token

    if session && (session.expires_at.nil? || session.expires_at > Time.current)
      Current.session = session
      Current.user = session.user
    else
      response.set_header("WWW-Authenticate", "Bearer")
      render json: {
        error: {
          code: "unauthorized",
          message: "A valid bearer token is required.",
        },
      }, status: :unauthorized
    end
  end
end
