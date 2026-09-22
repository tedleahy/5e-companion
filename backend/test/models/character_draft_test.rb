require "test_helper"

class CharacterDraftTest < ActiveSupport::TestCase
  test "requires a known kind" do
    draft = CharacterDraft.new(user: users(:one))

    assert_not draft.valid?
    assert_includes draft.errors[:kind], "is not included in the list"
  end

  test "defaults state" do
    assert_equal({}, CharacterDraft.new(user: users(:one)).state)
  end

  test "a level-up draft requires a character and base lock version" do
    draft = CharacterDraft.new(user: users(:one), kind: "level_up")

    assert_not draft.valid?
    assert_includes draft.errors[:character], "can't be blank"
    assert_includes draft.errors[:base_character_lock_version], "can't be blank"
  end

  test "a creation draft must not name a character" do
    draft = CharacterDraft.new(
      user: users(:one),
      kind: "creation",
      character: characters(:one),
      base_character_lock_version: 0
    )

    assert_not draft.valid?
    assert_includes draft.errors[:character], "must be blank"
    assert_includes draft.errors[:base_character_lock_version], "must be blank"
  end

  test "a character may have only one draft" do
    draft = CharacterDraft.new(
      user: users(:one),
      kind: "level_up",
      character: characters(:one),
      base_character_lock_version: 0
    )

    assert_not draft.valid?
    assert_includes draft.errors[:character_id], "has already been taken"
  end

  test "many creation drafts are allowed" do
    draft = CharacterDraft.new(user: users(:two), kind: "creation")

    assert draft.valid?
  end

  test "a level-up draft must belong to the character's user" do
    draft = CharacterDraft.new(
      user: users(:one),
      kind: "level_up",
      character: characters(:two),
      base_character_lock_version: 0
    )

    assert_not draft.valid?
    assert_includes draft.errors[:character], "must belong to user"
  end

  test "database rejects an unknown kind" do
    assert_raises ActiveRecord::StatementInvalid do
      character_drafts(:two).update_column(:kind, "multiclass")
    end
  end

  test "database rejects a creation draft that names a character" do
    assert_raises ActiveRecord::StatementInvalid do
      character_drafts(:two).update_columns(character_id: characters(:two).id)
    end
  end

  test "database rejects two drafts for one character" do
    assert_raises ActiveRecord::RecordNotUnique do
      character_drafts(:two).update_columns(
        kind: "level_up",
        character_id: characters(:one).id,
        base_character_lock_version: 0
      )
    end
  end

  test "database rejects a draft for another user's character" do
    assert_raises ActiveRecord::InvalidForeignKey do
      character_drafts(:one).update_column(:character_id, characters(:two).id)
    end
  end

  test "deleting a character cascades to its draft in the database" do
    character = characters(:one)
    draft_id = character_drafts(:one).id

    character.delete

    assert_not CharacterDraft.exists?(draft_id)
  end

  test "deleting a user cascades to drafts in the database" do
    user = users(:one)
    draft_id = character_drafts(:one).id

    user.delete

    assert_not CharacterDraft.exists?(draft_id)
  end
end
