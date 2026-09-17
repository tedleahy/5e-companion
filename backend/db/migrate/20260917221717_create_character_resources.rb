class CreateCharacterResources < ActiveRecord::Migration[8.1]
  def change
    create_table :character_resources do |t|
      t.references :character, null: false,
        foreign_key: { on_delete: :cascade }, index: false
      t.references :character_class, foreign_key: { on_delete: :cascade }
      t.text :key, null: false
      t.text :name, null: false
      t.integer :current, null: false
      t.integer :maximum_override
      t.text :reset_on, null: false
      t.jsonb :state, null: false, default: {}

      t.timestamps
    end

    add_index :character_resources,
      [:character_id, :character_class_id, :key],
      unique: true,
      nulls_not_distinct: true

    add_check_constraint :character_resources,
      "current >= 0",
      name: "character_resources_current_check"
    add_check_constraint :character_resources,
      "maximum_override IS NULL OR maximum_override >= 0",
      name: "character_resources_maximum_override_check"
    add_check_constraint :character_resources,
      "reset_on IN ('short_rest', 'long_rest', 'dawn', 'manual')",
      name: "character_resources_reset_on_check"
    add_check_constraint :character_resources,
      "jsonb_typeof(state) = 'object'",
      name: "character_resources_state_object_check"
  end
end
