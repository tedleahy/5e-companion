require "test_helper"

class CharacterClassTest < ActiveSupport::TestCase
  test "requires its structural fields" do
    character_class = CharacterClass.new(character: characters(:one))

    assert_not character_class.valid?
    assert_includes character_class.errors[:name], "can't be blank"
    assert_includes character_class.errors[:level], "is not a number"
    assert_includes character_class.errors[:position], "is not a number"
  end

  test "requires a positive level" do
    character_class = character_classes(:one)

    character_class.level = 0
    assert_not character_class.valid?
    assert_includes character_class.errors[:level], "must be greater than 0"

    character_class.level = 1
    assert character_class.valid?
  end

  test "requires a non-negative position" do
    character_class = character_classes(:one)

    character_class.position = -1
    assert_not character_class.valid?
    assert_includes character_class.errors[:position], "must be greater than or equal to 0"

    character_class.position = 0
    assert character_class.valid?
  end

  test "position is unique per character" do
    character_class = CharacterClass.new(
      character: characters(:one),
      name: "Wizard",
      level: 1,
      position: character_classes(:one).position
    )

    assert_not character_class.valid?
    assert_includes character_class.errors[:position], "has already been taken"
  end

  test "database rejects a non-positive level" do
    assert_raises ActiveRecord::StatementInvalid do
      character_classes(:one).update_column(:level, 0)
    end
  end

  test "database rejects a duplicate position for one character" do
    duplicate = character_classes(:two)

    assert_raises ActiveRecord::RecordNotUnique do
      duplicate.update_column(:character_id, characters(:one).id)
    end
  end

  test "deleting a character cascades to character classes in the database" do
    character = characters(:one)
    character_class_id = character_classes(:one).id

    character.delete

    assert_not CharacterClass.exists?(character_class_id)
  end

  test "destroying a class destroys its resources" do
    character_class = character_classes(:one)
    resource_id = character_resources(:one).id

    character_class.destroy

    assert_not CharacterResource.exists?(resource_id)
  end
end
