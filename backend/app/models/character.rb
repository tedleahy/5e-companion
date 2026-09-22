# A confirmed player character: identity, token ink colour, ancestry, and hit
# points. Unfinished creation and level-up flows live in CharacterDraft, never
# here. Owns its classes, resources, features, and effects.
class Character < ApplicationRecord
  belongs_to :user

  has_many :character_classes, dependent: :destroy
  has_many :character_resources, dependent: :destroy
  has_many :character_features, dependent: :destroy
  has_many :character_effects, dependent: :destroy
  has_one :character_draft, dependent: :destroy

  validates :name, :rules_version, presence: true
  validates :token_ink, format: { with: /\A#[0-9a-f]{6}\z/i }
  validates :maximum_hit_points, :current_hit_points,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :temporary_hit_points, :lock_version,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }

  def total_level
    character_classes.sum(&:level)
  end

  def effective_armor_class
    overrides["armor_class"]
  end
end
