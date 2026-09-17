require "test_helper"

class CharacterTest < ActiveSupport::TestCase
  test "requires its structural fields" do
    character = Character.new(user: users(:one), token_ink: nil)

    assert_not character.valid?
    assert_includes character.errors[:name], "can't be blank"
    assert_includes character.errors[:rules_version], "can't be blank"
    assert_includes character.errors[:token_ink], "is invalid"
  end

  test "accepts only non-negative hit points" do
    character = characters(:one)

    %i[maximum_hit_points current_hit_points temporary_hit_points].each do |attribute|
      character.public_send("#{attribute}=", -1)
      assert_not character.valid?
      assert_includes character.errors[attribute], "must be greater than or equal to 0"
      character.public_send("#{attribute}=", 0)
    end
  end

  test "token ink must be a six-digit hex color" do
    character = characters(:one)

    character.token_ink = "structural"

    assert_not character.valid?
    assert_includes character.errors[:token_ink], "is invalid"
  end

  test "database rejects an invalid token ink" do
    assert_raises ActiveRecord::StatementInvalid do
      characters(:one).update_column(:token_ink, "purple")
    end
  end

  test "deleting a user cascades to characters in the database" do
    user = users(:one)
    character_id = characters(:one).id

    user.delete

    assert_not Character.exists?(character_id)
  end
end
