class Character < ApplicationRecord
  belongs_to :user

  validates :name, :rules_version, presence: true
  validates :token_ink, format: { with: /\A#[0-9a-f]{6}\z/i }
  validates :maximum_hit_points, :current_hit_points,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :temporary_hit_points, :lock_version,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
