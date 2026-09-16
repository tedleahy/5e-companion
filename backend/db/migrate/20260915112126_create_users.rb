class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.text :email, null: false
      t.text :password_digest, null: false

      t.timestamps
    end

    add_index :users, 'LOWER(email)', unique: true, name: 'index_users_on_lower_email'
  end
end
