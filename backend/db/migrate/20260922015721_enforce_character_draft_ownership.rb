class EnforceCharacterDraftOwnership < ActiveRecord::Migration[8.1]
  def change
    remove_index :characters, :user_id
    add_index :characters, [ :user_id, :id ], unique: true

    remove_foreign_key :character_drafts, :characters,
      column: :character_id,
      primary_key: :id,
      on_delete: :cascade
    add_foreign_key :character_drafts, :characters,
      column: [ :user_id, :character_id ],
      primary_key: [ :user_id, :id ],
      on_delete: :cascade
  end
end
