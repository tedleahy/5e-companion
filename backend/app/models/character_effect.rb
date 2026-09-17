class CharacterEffect < ApplicationRecord
  belongs_to :character

  validates :effect_key, :name, presence: true
  validates :effect_key, uniqueness: { scope: :character_id }
end
