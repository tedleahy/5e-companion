# A class feature, racial trait, feat, or manual addition on the sheet. state
# holds character-specific selections, such as a Wild Shape's known forms.
# position orders a character's features and traits.
class CharacterFeature < ApplicationRecord
  belongs_to :character

  validates :name, presence: true
  validates :position, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
end
