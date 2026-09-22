require "test_helper"

class Api::V1::CharactersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = users(:one)
    @token = "character-list-test-token"
    @user.sessions.create!(token_digest: Digest::SHA256.hexdigest(@token))

    @level_up = character_drafts(:one)
    @level_up.update!(
      state: {
        from_level: 1,
        to_level: 2,
        completed_choices: 3,
        total_choices: 5,
        next_step: "ability_score_or_feat",
      },
    )
    @creation = @user.character_drafts.create!(
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

  test "rejects missing, unknown, and expired bearer tokens" do
    @user.sessions.create!(
      token_digest: Digest::SHA256.hexdigest("expired-token"),
      expires_at: 1.minute.ago,
    )

    [ {}, { "Authorization" => "Bearer unknown" }, { "Authorization" => "Bearer expired-token" } ].each do |headers|
      get api_v1_characters_url, headers: headers

      assert_response :unauthorized

      assert_equal({
        "error" => {
          "code" => "unauthorized",
          "message" => "A valid bearer token is required.",
        },
      }, response.parsed_body)
    end
  end

  test "never returns another user's characters or drafts" do
    get_characters

    assert_not_includes body_ids("characters"), characters(:two).id.to_s
    assert_not_includes body_ids("drafts"), character_drafts(:two).id.to_s

    get_characters(q: characters(:two).name)

    assert_empty response.parsed_body["characters"]
  end

  test "returns only the documented character and draft fields" do
    vesper = characters(:one)
    vesper.update!(race_name: "Gnome", subrace_name: "Rock gnome")
    character_classes(:one).update!(name: "Wizard", subclass_name: "Divination", level: 5)
    vesper.character_classes.create!(name: "Rogue", level: 2, position: 2)

    get_characters

    assert_response :ok

    body = response.parsed_body
    assert_equal [ "characters", "drafts" ], body.keys

    assert_equal [ {
      "id" => vesper.id.to_s,
      "name" => "Vesper",
      "ancestry" => { "race_name" => "Gnome", "subrace_name" => "Rock gnome" },
      "classes" => [
        { "name" => "Wizard", "level" => 5, "subclass_name" => "Divination" },
        { "name" => "Rogue", "level" => 2, "subclass_name" => nil },
      ],
      "total_level" => 7,
      "hit_points" => { "current" => 18, "maximum" => 24, "temporary" => 0 },
    } ], body["characters"]

    drafts = body["drafts"].index_by { |draft| draft["kind"] }
    assert_equal({
      "id" => @creation.id.to_s,
      "kind" => "creation",
      "name" => "Nyra Ashfall",
      "completed_choices" => 2,
      "total_choices" => 5,
      "next_step" => "choose_class",
    }, drafts["creation"])

    assert_equal({
      "id" => @level_up.id.to_s,
      "kind" => "level_up",
      "character_id" => vesper.id.to_s,
      "character_name" => "Vesper",
      "from_level" => 1,
      "to_level" => 2,
      "completed_choices" => 3,
      "total_choices" => 5,
      "next_step" => "ability_score_or_feat",
    }, drafts["level_up"])
  end

  test "returns classes in position order" do
    character = create_character("Ordered")
    character.character_classes.create!(name: "Rogue", level: 1, position: 2)
    character.character_classes.create!(name: "Wizard", level: 1, position: 1)

    get_characters(q: "Ordered")

    assert_equal %w[Wizard Rogue], response.parsed_body["characters"].first["classes"].pluck("name")
  end

  test "orders drafts by most recently updated, then id descending" do
    unnamed = @user.character_drafts.create!(
      kind: "creation",
      state: { completed_choices: 0, total_choices: 5, next_step: "choose_name" },
    )
    @level_up.update_columns(updated_at: 2.days.ago)
    tied_at = 1.hour.ago
    @creation.update_columns(updated_at: tied_at)
    unnamed.update_columns(updated_at: tied_at)

    get_characters

    assert_equal [ unnamed, @creation, @level_up ].map { |draft| draft.id.to_s }, body_ids("drafts")

    unnamed_summary = response.parsed_body["drafts"].first
    assert unnamed_summary.key?("name")

    assert_nil unnamed_summary["name"]
  end

  test "searches names case-insensitively after trimming whitespace" do
    create_character("Kethra")

    get_characters(q: "  vESPer  ")

    assert_response :ok

    assert_equal [ characters(:one).id.to_s ], body_ids("characters")
  end

  test "treats percent, underscore, and backslash as literal search text" do
    percent = create_character("100% Sure")
    underscore = create_character("Snake_Eyes")
    backslash = create_character("Back\\Slash")

    { "%" => percent, "_" => underscore, "\\" => backslash }.each do |query, expected|
      get_characters(q: query)

      assert_equal [ expected.id.to_s ], body_ids("characters"), "searching for #{query.inspect}"
    end
  end

  test "searching never hides drafts" do
    { "   " => [ characters(:one).id.to_s ], "no such character" => [] }.each do |query, character_ids|
      get_characters(q: query)

      assert_response :ok

      assert_equal character_ids, body_ids("characters"), "searching for #{query.inspect}"

      assert_equal [ @creation.id.to_s, @level_up.id.to_s ].sort, body_ids("drafts").sort
    end
  end

  test "sorts by total level, then case-insensitive name, then id" do
    zed = create_character("Zed", [ 9 ])
    lower_bravo = create_character("bravo", [ 5 ])
    upper_bravo = create_character("Bravo", [ 4, 1 ])
    alpha = create_character("alpha", [ 3, 2 ])
    aaron = create_character("Aaron")
    expected = [ zed, alpha, lower_bravo, upper_bravo, characters(:one), aaron ].map { |character| character.id.to_s }

    [ {}, { sort: "" }, { sort: "level" } ].each do |params|
      get_characters(**params)

      assert_equal expected, body_ids("characters"), "with params #{params.inspect}"
    end
  end

  test "sorts by case-insensitive name, then id" do
    zed = create_character("Zed", [ 9 ])
    lower_bravo = create_character("bravo", [ 5 ])
    upper_bravo = create_character("Bravo", [ 4, 1 ])
    alpha = create_character("alpha", [ 3, 2 ])
    aaron = create_character("Aaron")

    get_characters(sort: "name")

    expected = [ aaron, alpha, lower_bravo, upper_bravo, characters(:one), zed ].map { |character| character.id.to_s }
    assert_equal expected, body_ids("characters")
  end

  test "accepts a search of 100 characters after trimming" do
    [ "a" * 100, "  #{"a" * 100}  " ].each do |query|
      get_characters(q: query)

      assert_response :ok
    end
  end

  test "rejects invalid query parameters with the stable error" do
    [
      { sort: "newest" },
      { sort: [ "level" ] },
      { sort: { by: "level" } },
      { q: [ "Vesper" ] },
      { q: { name: "Vesper" } },
      { q: "a" * 101 },
    ].each do |params|
      get_characters(**params)

      assert_response :bad_request, "with params #{params.inspect}"

      assert_equal({
        "error" => {
          "code" => "invalid_query",
          "message" => "Unsupported query parameters.",
        },
      }, response.parsed_body)
    end
  end

  test "does not query associations per character or draft" do
    # No warm-up request: repeating an identical request would be served from
    # the query cache and count as zero queries.
    baseline = count_queries { get_characters }

    3.times do |index|
      character = create_character("Extra #{index}", [ 2, 1 ])
      @user.character_drafts.create!(kind: "level_up", character: character, base_character_lock_version: 0, state: @level_up.state)
      @user.character_drafts.create!(kind: "creation", state: @creation.state)
    end

    assert_queries_count(baseline) { get_characters }
  end

  private

  def get_characters(**params)
    get api_v1_characters_url, params: params, headers: { "Authorization" => "Bearer #{@token}" }
  end

  def body_ids(key)
    response.parsed_body[key].pluck("id")
  end

  # Creates a character owned by the test user with one class per level given.
  # @param name [String]
  # @param class_levels [Array<Integer>] levels in position order
  # @return [Character]
  def create_character(name, class_levels = [])
    character = @user.characters.create!(name: name, token_ink: "#123456", rules_version: "2014")
    class_levels.each_with_index do |level, position|
      character.character_classes.create!(name: "Fighter", level: level, position: position)
    end
    character
  end

  # Counts the non-schema, uncached SQL queries run inside the block.
  # @return [Integer]
  def count_queries(&block)
    count = 0
    counter = ->(*, payload) { count += 1 unless payload[:cached] || payload[:name] == "SCHEMA" }
    ActiveSupport::Notifications.subscribed(counter, "sql.active_record", &block)
    count
  end
end
