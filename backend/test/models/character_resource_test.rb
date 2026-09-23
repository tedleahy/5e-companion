require "test_helper"

class CharacterResourceTest < ActiveSupport::TestCase
  test "requires its structural fields" do
    resource = CharacterResource.new(character: characters(:one))

    assert_not resource.valid?
    assert_includes resource.errors[:key], "can't be blank"
    assert_includes resource.errors[:name], "can't be blank"
    assert_includes resource.errors[:current], "is not a number"
    assert_includes resource.errors[:reset_on], "is not included in the list"
  end

  test "requires non-negative current and maximum override" do
    resource = character_resources(:one)

    resource.current = -1
    assert_not resource.valid?
    assert_includes resource.errors[:current], "must be greater than or equal to 0"

    resource.current = 0
    resource.maximum_override = -1
    assert_not resource.valid?
    assert_includes resource.errors[:maximum_override], "must be greater than or equal to 0"

    resource.maximum_override = nil
    assert resource.valid?
  end

  test "accepts only the reset_on vocabulary" do
    resource = character_resources(:one)

    %w[short_rest long_rest dawn manual].each do |value|
      resource.reset_on = value
      assert resource.valid?, "expected #{value.inspect} to be valid"
    end

    resource.reset_on = "per_turn"
    assert_not resource.valid?
    assert_includes resource.errors[:reset_on], "is not included in the list"
  end

  test "key is unique per character and class" do
    resource = CharacterResource.new(
      character: characters(:two),
      key: character_resources(:two).key,
      name: "Lay on Hands",
      current: 15,
      reset_on: "long_rest"
    )

    assert_not resource.valid?
    assert_includes resource.errors[:key], "has already been taken"
  end

  test "the same key may exist for a different class" do
    resource = CharacterResource.new(
      character: characters(:two),
      character_class: character_classes(:two),
      key: character_resources(:two).key,
      name: "Lay on Hands",
      current: 15,
      reset_on: "long_rest"
    )

    assert resource.valid?
  end

  test "database rejects a negative current" do
    assert_raises ActiveRecord::StatementInvalid do
      character_resources(:one).update_column(:current, -1)
    end
  end

  test "database rejects an unknown reset_on" do
    assert_raises ActiveRecord::StatementInvalid do
      character_resources(:one).update_column(:reset_on, "per_turn")
    end
  end

  test "database treats a null class as a distinct uniqueness scope" do
    assert_raises ActiveRecord::RecordNotUnique do
      character_resources(:one).update_columns(
        character_id: characters(:two).id,
        character_class_id: nil,
        key: character_resources(:two).key
      )
    end
  end

  test "deleting a character cascades to resources in the database" do
    character = characters(:one)
    resource_id = character_resources(:one).id

    character.delete

    assert_not CharacterResource.exists?(resource_id)
  end

  test "deleting a character class cascades to its resources in the database" do
    character_class = character_classes(:one)
    resource_id = character_resources(:one).id

    character_class.delete

    assert_not CharacterResource.exists?(resource_id)
  end
end
