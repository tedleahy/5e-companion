# An active condition or spell effect, such as Hex, Poisoned, or Unconscious.
# effect_key is unique per character and is_concentration marks the effect that
# maintains concentration.
class CharacterEffect < ApplicationRecord
  belongs_to :character

  validates :effect_key, :name, presence: true
  validates :effect_key, uniqueness: { scope: :character_id }
end
