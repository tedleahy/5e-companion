# A bearer-token login session. Only the SHA-256 digest of the token is stored;
# the plaintext token is returned once when the session is created. A session
# with a past expires_at is no longer valid.
class Session < ApplicationRecord
  belongs_to :user

  validates :token_digest, presence: true, uniqueness: true
end
