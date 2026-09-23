# A pool of uses, such as spell slots, hit dice, or Lay on Hands.
# maximum_override replaces the maximum derived from the character's rules; null
# means derive normally. reset_on names which rest recovers it, and key is
# stable per character and class.
class CharacterResource < ApplicationRecord
  belongs_to :character
  belongs_to :character_class, optional: true

  validates :key, :name, presence: true
  validates :current, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :maximum_override,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validates :reset_on, inclusion: { in: %w[short_rest long_rest dawn manual] }
  validates :key, uniqueness: { scope: [ :character_id, :character_class_id ] }
end
