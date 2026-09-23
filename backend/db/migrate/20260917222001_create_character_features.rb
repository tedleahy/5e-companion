class CreateCharacterFeatures < ActiveRecord::Migration[8.1]
  def change
    create_table :character_features do |t|
      t.references :character, null: false,
        foreign_key: { on_delete: :cascade }
      t.text :name, null: false
      t.text :description
      t.jsonb :state, null: false, default: {}
      t.integer :position, null: false, default: 0

      t.timestamps
    end

    add_check_constraint :character_features,
      "position >= 0",
      name: "character_features_position_check"
    add_check_constraint :character_features,
      "jsonb_typeof(state) = 'object'",
      name: "character_features_state_object_check"
  end
end
