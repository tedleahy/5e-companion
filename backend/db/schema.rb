# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_09_17_220950) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "character_classes", force: :cascade do |t|
    t.bigint "character_id", null: false
    t.datetime "created_at", null: false
    t.integer "level", null: false
    t.text "name", null: false
    t.integer "position", null: false
    t.text "subclass_name"
    t.datetime "updated_at", null: false
    t.index ["character_id", "position"], name: "index_character_classes_on_character_id_and_position", unique: true
    t.check_constraint "\"position\" >= 0", name: "character_classes_position_check"
    t.check_constraint "level > 0", name: "character_classes_level_check"
  end

  create_table "characters", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "current_hit_points"
    t.integer "lock_version", default: 0, null: false
    t.integer "maximum_hit_points"
    t.text "name", null: false
    t.jsonb "overrides", default: {}, null: false
    t.text "race_name"
    t.text "rules_version", null: false
    t.text "subrace_name"
    t.integer "temporary_hit_points", default: 0, null: false
    t.text "token_ink", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["user_id"], name: "index_characters_on_user_id"
    t.check_constraint "char_length(token_ink) = 7 AND token_ink ~ '^#[0-9A-Fa-f]{6}$'::text", name: "characters_token_ink_check"
    t.check_constraint "current_hit_points IS NULL OR current_hit_points >= 0", name: "characters_current_hp_check"
    t.check_constraint "jsonb_typeof(overrides) = 'object'::text", name: "characters_overrides_object_check"
    t.check_constraint "lock_version >= 0", name: "characters_lock_version_check"
    t.check_constraint "maximum_hit_points IS NULL OR maximum_hit_points >= 0", name: "characters_maximum_hp_check"
    t.check_constraint "temporary_hit_points >= 0", name: "characters_temporary_hp_check"
  end

  create_table "sessions", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.text "token_digest", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["token_digest"], name: "index_sessions_on_token_digest", unique: true
    t.index ["user_id"], name: "index_sessions_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "email", null: false
    t.text "password_digest", null: false
    t.datetime "updated_at", null: false
    t.index "lower(email)", name: "index_users_on_lower_email", unique: true
  end

  add_foreign_key "character_classes", "characters", on_delete: :cascade
  add_foreign_key "characters", "users", on_delete: :cascade
  add_foreign_key "sessions", "users", on_delete: :cascade
end
