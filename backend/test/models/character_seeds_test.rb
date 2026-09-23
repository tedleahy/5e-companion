require "test_helper"

class CharacterSeedsTest < ActiveSupport::TestCase
  test "refuses to expose demo credentials outside local environments" do
    seed = Rails.root.join("db/seeds/character_list.rb")
    environment = Rails.env
    local = environment.method(:local?)
    environment.define_singleton_method(:local?) { false }

    error = assert_raises(RuntimeError) { capture_io { load seed } }
    assert_equal "Character-list demo seeds are local only", error.message
  ensure
    environment&.define_singleton_method(:local?, local) if local
  end

  test "reruns preserve omitted associations and match resources by class" do
    seed = Rails.root.join("db/seeds/character_list.rb")
    capture_io { load seed }

    demo = User.find_by!(email: "demo@example.test")
    assert_equal 6, demo.characters.count
    assert_equal [ "Orik Stonehand" ], User.find_by!(email: "other@example.test").characters.pluck(:name)
    draft = demo.character_drafts.sole
    assert_equal "level_up", draft.kind
    assert_equal "Kethra Ironsong", draft.character.name

    vesper = demo.characters.find_by!(name: "Vesper Quill")
    rogue = vesper.character_classes.find_by!(name: "Rogue")
    vesper.character_resources.find_by!(key: "portent").destroy!
    extra = vesper.character_resources.create!(
      character_class: rogue, key: "portent", name: "Keep me", current: 0, reset_on: "manual"
    )
    effect = vesper.character_effects.create!(effect_key: "blessed", name: "Blessed")

    capture_io { load seed }
    assert_equal "Keep me", extra.reload.name
    assert_equal "Blessed", effect.reload.name
    portent = vesper.character_resources.find_by!(key: "portent", character_class: vesper.character_classes.find_by!(name: "Wizard"))
    assert_equal "Portent", portent.name

    models = [ User, Session, Character, CharacterClass, CharacterResource, CharacterFeature, CharacterEffect, CharacterDraft ]
    counts = models.map(&:count)
    capture_io { load seed }
    assert_equal counts, models.map(&:count)
  end
end
