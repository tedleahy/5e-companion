require "test_helper"

class Api::V1::CharactersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = "character-list-test-token"
    @user.sessions.create!(token_digest: Digest::SHA256.hexdigest(@token))

    character_drafts(:one).update!(
      state: {
        from_level: 1,
        to_level: 2,
        completed_choices: 3,
        total_choices: 5,
        next_step: "ability_score_or_feat",
      },
    )
    @user.character_drafts.create!(
      kind: "creation",
      state: {
        name: "Nyra Ashfall",
        completed_choices: 2,
        total_choices: 5,
        next_step: "choose_class",
      },
    )
  end

  teardown { Current.reset }

  test "returns owned character summaries and both draft kinds" do
    get api_v1_characters_url, headers: authorization_header

    assert_response :ok

    body = response.parsed_body
    assert_equal [ "characters", "drafts" ], body.keys
    assert_equal [ characters(:one).id.to_s ], body["characters"].pluck("id")
    assert_equal %w[creation level_up], body["drafts"].pluck("kind").sort

    character = body["characters"].first
    assert_equal %w[ancestry classes hit_points id name total_level], character.keys.sort
    assert_equal 0, character.dig("hit_points", "temporary")

    creation = body["drafts"].find { |draft| draft["kind"] == "creation" }
    assert_equal "Nyra Ashfall", creation["name"]

    level_up = body["drafts"].find { |draft| draft["kind"] == "level_up" }
    assert_equal characters(:one).id.to_s, level_up["character_id"]
  end

  test "rejects invalid query parameters with the stable error" do
    get api_v1_characters_url,
      params: { sort: "newest" },
      headers: authorization_header

    assert_response :bad_request
    assert_equal({
      "error" => {
        "code" => "invalid_query",
        "message" => "Unsupported query parameters.",
      },
    }, response.parsed_body)
  end

  private

  def authorization_header
    { "Authorization" => "Bearer #{@token}" }
  end
end
