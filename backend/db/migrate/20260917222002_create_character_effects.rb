class CreateCharacterEffects < ActiveRecord::Migration[8.1]
  def change
    create_table :character_effects do |t|
      t.references :character, null: false,
        foreign_key: { on_delete: :cascade }, index: false
      t.text :effect_key, null: false
      t.text :name, null: false
      t.boolean :is_concentration, null: false, default: false
      t.jsonb :state, null: false, default: {}

      t.timestamps
    end

    add_index :character_effects, [:character_id, :effect_key], unique: true

    add_check_constraint :character_effects,
      "jsonb_typeof(state) = 'object'",
      name: "character_effects_state_object_check"
  end
end
