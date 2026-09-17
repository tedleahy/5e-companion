# One class on a character, such as Fighter 8 or Rogue 2, with an optional
# subclass. position orders a multiclass character's classes and is unique per
# character.
class CharacterClass < ApplicationRecord
  belongs_to :character

  validates :name, presence: true
  validates :level, numericality: { only_integer: true, greater_than: 0 }
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 },
    uniqueness: { scope: :character_id }
end
