require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "requires an email" do
    user = User.new(password: "password")

    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test "requires a password" do
    user = User.new(email: "new@example.test")

    assert_not user.valid?
    assert_includes user.errors[:password], "can't be blank"
  end

  test "email uniqueness is case insensitive" do
    user = User.new(email: users(:one).email.upcase, password: "password")

    assert_not user.valid?
    assert_includes user.errors[:email], "has already been taken"
  end

  test "authenticates the correct password" do
    assert users(:one).authenticate("password-one")
    assert_not users(:one).authenticate("wrong-password")
  end

  test "deleting a user cascades to sessions in the database" do
    user = users(:one)
    session_id = sessions(:one).id

    user.delete

    assert_not Session.exists?(session_id)
  end
end
