class CreateCharacterDrafts < ActiveRecord::Migration[8.1]
  def change
    create_table :character_drafts do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.references :character, foreign_key: { on_delete: :cascade }, index: false
      t.text :kind, null: false
      t.integer :base_character_lock_version
      t.jsonb :state, null: false, default: {}

      t.timestamps
    end

    add_index :character_drafts, :character_id, unique: true

    add_check_constraint :character_drafts,
      "kind IN ('creation', 'level_up')",
      name: "character_drafts_kind_check"
    add_check_constraint :character_drafts,
      "base_character_lock_version IS NULL OR base_character_lock_version >= 0",
      name: "character_drafts_base_lock_version_check"
    add_check_constraint :character_drafts,
      "(kind = 'creation' AND character_id IS NULL AND base_character_lock_version IS NULL) OR " \
      "(kind = 'level_up' AND character_id IS NOT NULL AND base_character_lock_version IS NOT NULL)",
      name: "character_drafts_kind_requirements_check"
    add_check_constraint :character_drafts,
      "jsonb_typeof(state) = 'object'",
      name: "character_drafts_state_object_check"
  end
end
