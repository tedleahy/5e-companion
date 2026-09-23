require "test_helper"

class SessionTest < ActiveSupport::TestCase
  test "requires a user" do
    session = Session.new(token_digest: "new-token-digest")

    assert_not session.valid?
    assert_includes session.errors[:user], "must exist"
  end

  test "requires a token digest" do
    session = Session.new(user: users(:one))

    assert_not session.valid?
    assert_includes session.errors[:token_digest], "can't be blank"
  end

  test "requires a unique token digest" do
    session = Session.new(user: users(:two), token_digest: sessions(:one).token_digest)

    assert_not session.valid?
    assert_includes session.errors[:token_digest], "has already been taken"
  end

  test "allows an expiry time to be absent" do
    session = Session.new(user: users(:one), token_digest: "new-token-digest")

    assert session.valid?
  end

  test "database rejects a missing token digest" do
    assert_raises ActiveRecord::NotNullViolation do
      Session.transaction(requires_new: true) do
        Session.insert_all!([ { user_id: users(:one).id, token_digest: nil } ])
      end
    end
  end

  test "database rejects a duplicate token digest" do
    assert_raises ActiveRecord::RecordNotUnique do
      Session.transaction(requires_new: true) do
        Session.insert_all!([ { user_id: users(:two).id, token_digest: sessions(:one).token_digest } ])
      end
    end
  end
end
