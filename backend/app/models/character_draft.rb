# One unfinished character flow: creation (no character yet) or level_up for an
# existing character. Wizard answers live in state; a level-up draft copies the
# character's lock_version to base_character_lock_version so confirmation can
# reject a draft that went stale. Confirming writes the character and deletes
# the draft.
class CharacterDraft < ApplicationRecord
  belongs_to :user
  belongs_to :character, optional: true

  validates :kind, inclusion: { in: %w[creation level_up] }
  validates :character_id, uniqueness: true, allow_nil: true
  validates :base_character_lock_version,
    numericality: { only_integer: true, greater_than_or_equal_to: 0 }, allow_nil: true
  validate :kind_requirements
  validate :character_belongs_to_user

  private

  def kind_requirements
    if kind == "creation"
      errors.add(:character, "must be blank") if character_id.present?
      errors.add(:base_character_lock_version, "must be blank") if base_character_lock_version.present?
    elsif kind == "level_up"
      errors.add(:character, "can't be blank") if character_id.blank?
      errors.add(:base_character_lock_version, "can't be blank") if base_character_lock_version.blank?
    end
  end

  def character_belongs_to_user
    return unless character && user_id

    errors.add(:character, "must belong to user") if character.user_id != user_id
  end
end
