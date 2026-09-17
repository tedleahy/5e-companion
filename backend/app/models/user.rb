# An account that signs in with email and password. Owns its characters and
# sessions; deleting a user cascades to both.
class User < ApplicationRecord
  has_secure_password

  validates :email, uniqueness: { case_sensitive: false }, presence: true

  has_many :characters, dependent: :destroy
  has_many :sessions, dependent: :destroy
end
