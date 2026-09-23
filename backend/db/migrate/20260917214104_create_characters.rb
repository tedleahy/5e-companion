class CreateCharacters < ActiveRecord::Migration[8.1]
  def change
    create_table :characters do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.text :name, null: false
      t.text :token_ink, null: false
      t.text :rules_version, null: false
      t.text :race_name
      t.text :subrace_name
      t.integer :maximum_hit_points
      t.integer :current_hit_points
      t.integer :temporary_hit_points, null: false, default: 0
      t.jsonb :overrides, null: false, default: {}
      t.integer :lock_version, null: false, default: 0

      t.timestamps
    end

    add_check_constraint :characters,
      "char_length(token_ink) = 7 AND token_ink ~ '^#[0-9A-Fa-f]{6}$'",
      name: "characters_token_ink_check"
    add_check_constraint :characters,
      "maximum_hit_points IS NULL OR maximum_hit_points >= 0",
      name: "characters_maximum_hp_check"
    add_check_constraint :characters,
      "current_hit_points IS NULL OR current_hit_points >= 0",
      name: "characters_current_hp_check"
    add_check_constraint :characters,
      "temporary_hit_points >= 0",
      name: "characters_temporary_hp_check"
    add_check_constraint :characters,
      "lock_version >= 0",
      name: "characters_lock_version_check"
    add_check_constraint :characters,
      "jsonb_typeof(overrides) = 'object'",
      name: "characters_overrides_object_check"
  end
end
