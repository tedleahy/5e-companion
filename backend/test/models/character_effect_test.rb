require "test_helper"

class CharacterEffectTest < ActiveSupport::TestCase
  test "requires its structural fields" do
    effect = CharacterEffect.new(character: characters(:one))

    assert_not effect.valid?
    assert_includes effect.errors[:effect_key], "can't be blank"
    assert_includes effect.errors[:name], "can't be blank"
  end

  test "defaults concentration and state" do
    effect = CharacterEffect.new(character: characters(:one))

    assert_equal false, effect.is_concentration
    assert_equal({}, effect.state)
  end

  test "effect key is unique per character" do
    effect = CharacterEffect.new(
      character: characters(:one),
      effect_key: character_effects(:one).effect_key,
      name: "Hex"
    )

    assert_not effect.valid?
    assert_includes effect.errors[:effect_key], "has already been taken"
  end

  test "the same effect key may exist for another character" do
    effect = CharacterEffect.new(
      character: characters(:two),
      effect_key: character_effects(:one).effect_key,
      name: "Hex"
    )

    assert effect.valid?
  end

  test "database rejects a duplicate effect key for one character" do
    assert_raises ActiveRecord::RecordNotUnique do
      character_effects(:two).update_columns(
        character_id: characters(:one).id,
        effect_key: character_effects(:one).effect_key
      )
    end
  end

  test "deleting a character cascades to effects in the database" do
    character = characters(:one)
    effect_id = character_effects(:one).id

    character.delete

    assert_not CharacterEffect.exists?(effect_id)
  end
end
