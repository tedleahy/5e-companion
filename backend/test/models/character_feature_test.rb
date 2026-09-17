require "test_helper"

class CharacterFeatureTest < ActiveSupport::TestCase
  test "requires a name" do
    feature = CharacterFeature.new(character: characters(:one))

    assert_not feature.valid?
    assert_includes feature.errors[:name], "can't be blank"
  end

  test "defaults state and position" do
    feature = CharacterFeature.new(character: characters(:one))

    assert_equal({}, feature.state)
    assert_equal 0, feature.position
  end

  test "requires a non-negative position" do
    feature = character_features(:one)

    feature.position = -1
    assert_not feature.valid?
    assert_includes feature.errors[:position], "must be greater than or equal to 0"

    feature.position = 0
    assert feature.valid?
  end

  test "database rejects a negative position" do
    assert_raises ActiveRecord::StatementInvalid do
      character_features(:one).update_column(:position, -1)
    end
  end

  test "deleting a character cascades to features in the database" do
    character = characters(:one)
    feature_id = character_features(:one).id

    character.delete

    assert_not CharacterFeature.exists?(feature_id)
  end
end
