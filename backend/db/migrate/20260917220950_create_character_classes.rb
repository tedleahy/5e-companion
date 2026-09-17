class CreateCharacterClasses < ActiveRecord::Migration[8.1]
  def change
    create_table :character_classes do |t|
      t.references :character, null: false,
        foreign_key: { on_delete: :cascade }, index: false
      t.text :name, null: false
      t.text :subclass_name
      t.integer :level, null: false
      t.integer :position, null: false

      t.timestamps
    end

    add_index :character_classes, [:character_id, :position], unique: true

    add_check_constraint :character_classes,
      "level > 0",
      name: "character_classes_level_check"
    add_check_constraint :character_classes,
      "position >= 0",
      name: "character_classes_position_check"
  end
end
