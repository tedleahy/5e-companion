class CreateSessions < ActiveRecord::Migration[8.1]
  def change
    create_table :sessions do |t|
      t.references :user, null: false, foreign_key: { on_delete: :cascade }
      t.text :token_digest, null: false, index: { unique: true }
      t.datetime :expires_at

      t.timestamps
    end
  end
end
