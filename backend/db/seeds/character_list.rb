# Loads the development dataset used by the character list mockup.
# Idempotent: rows are found by natural keys and updated, so `db:seed` can run
# repeatedly without duplicating records.
# Associations omitted from this dataset are preserved on reruns.

demo_token = "dev-character-list-token"
demo_password = "demo-password"

demo = nil
ActiveRecord::Base.transaction do
  demo = User.find_or_initialize_by(email: "demo@example.test")
  demo.update!(password: demo_password)
  demo.sessions.find_or_initialize_by(
    token_digest: Digest::SHA256.hexdigest(demo_token)
  ).update!(expires_at: nil)

  # A second account whose character must never appear in the demo user's list.
  other = User.find_or_initialize_by(email: "other@example.test")
  other.update!(password: "other-password")

  characters = [
    {
      name: "Thorn Grimsby",
      token_ink: "#e0689c",
      race_name: "Dwarf",
      subrace_name: "Mountain dwarf",
      maximum_hit_points: 72,
      current_hit_points: 68,
      overrides: { "armor_class" => 18 },
      classes: [
        { name: "Fighter", level: 8, subclass_name: "Champion" },
      ],
      resources: [
        { key: "second_wind", name: "Second Wind", current: 1, maximum_override: 1,
          reset_on: "short_rest", class_name: "Fighter", },
        { key: "action_surge", name: "Action Surge", current: 1, maximum_override: 1,
          reset_on: "short_rest", class_name: "Fighter", },
      ],
    },
    {
      name: "Alarra Vane",
      token_ink: "#2560b0",
      race_name: "Human",
      subrace_name: nil,
      maximum_hit_points: 52,
      current_hit_points: 38,
      overrides: { "armor_class" => 19 },
      classes: [
        { name: "Cleric", level: 7, subclass_name: "Life Domain" },
      ],
      resources: [
        { key: "channel_divinity", name: "Channel Divinity", current: 1, maximum_override: 2,
          reset_on: "short_rest", class_name: "Cleric", },
      ],
    },
    {
      name: "Vesper Quill",
      token_ink: "#5c3d88",
      race_name: "Gnome",
      subrace_name: "Rock gnome",
      maximum_hit_points: 26,
      current_hit_points: 12,
      overrides: { "armor_class" => 12 },
      classes: [
        { name: "Wizard", level: 5, subclass_name: "Divination" },
        { name: "Rogue", level: 2, subclass_name: nil },
      ],
      resources: [
        { key: "spell_slot_1", name: "Spell Slots (1st)", current: 2,
          reset_on: "long_rest", },
        { key: "portent", name: "Portent", current: 1, maximum_override: 2,
          reset_on: "long_rest", class_name: "Wizard", },
      ],
    },
    {
      name: "Brenna Duskhollow",
      token_ink: "#2560b0",
      race_name: "Half-elf",
      subrace_name: nil,
      maximum_hit_points: 44,
      current_hit_points: 31,
      temporary_hit_points: 5,
      overrides: { "armor_class" => 13 },
      classes: [
        { name: "Warlock", level: 6, subclass_name: "The Fiend" },
      ],
      resources: [
        { key: "pact_magic", name: "Pact Magic", current: 1, maximum_override: 2,
          reset_on: "short_rest", class_name: "Warlock", },
      ],
      effects: [
        { effect_key: "hex", name: "Hex", is_concentration: true },
      ],
    },
    {
      name: "Mudge Tealeaf",
      token_ink: "#e0689c",
      race_name: "Halfling",
      subrace_name: "Lightfoot halfling",
      maximum_hit_points: 27,
      current_hit_points: 9,
      overrides: { "armor_class" => 15 },
      classes: [
        { name: "Rogue", level: 4, subclass_name: "Arcane Trickster" },
      ],
      resources: [
        { key: "hit_dice", name: "Hit Dice", current: 1,
          reset_on: "short_rest", class_name: "Rogue", },
      ],
      features: [
        { name: "Sneak Attack",
          description: "Once per turn, deal extra damage to one creature you hit with an attack.", },
      ],
      effects: [
        { effect_key: "poisoned", name: "Poisoned", is_concentration: false },
      ],
    },
    {
      name: "Kethra Ironsong",
      token_ink: "#5c3d88",
      race_name: "Dwarf",
      subrace_name: "Hill dwarf",
      maximum_hit_points: 28,
      current_hit_points: 28,
      overrides: { "armor_class" => 18 },
      classes: [
        { name: "Paladin", level: 3, subclass_name: "Oath of Devotion" },
      ],
      resources: [
        { key: "lay_on_hands", name: "Lay on Hands", current: 15, maximum_override: 15,
          reset_on: "long_rest", class_name: "Paladin", },
      ],
    },
    {
      user: other,
      name: "Orik Stonehand",
      token_ink: "#2560b0",
      race_name: "Human",
      subrace_name: nil,
      maximum_hit_points: 24,
      current_hit_points: 20,
      overrides: { "armor_class" => 14 },
      classes: [
        { name: "Barbarian", level: 2, subclass_name: nil },
      ],
    },
  ]

  characters.each do |data|
    character = data.fetch(:user, demo).characters.find_or_initialize_by(name: data[:name])
    character.update!(
      { rules_version: "2014", temporary_hit_points: 0 }
        .merge(data.except(:user, :classes, :resources, :features, :effects))
    )

    data[:classes].each_with_index do |class_data, position|
      character.character_classes
        .find_or_initialize_by(position: position)
        .update!(class_data)
    end

    data.fetch(:resources, []).each do |resource_data|
      class_name = resource_data[:class_name]
      character_class = class_name && character.character_classes.find_by!(name: class_name)

      character.character_resources
        .find_or_initialize_by(key: resource_data[:key], character_class: character_class)
        .update!(resource_data.except(:class_name))
    end

    data.fetch(:features, []).each_with_index do |feature_data, position|
      character.character_features
        .find_or_initialize_by(name: feature_data[:name])
        .update!(feature_data.merge(position: position, state: {}))
    end

    data.fetch(:effects, []).each do |effect_data|
      character.character_effects
        .find_or_initialize_by(effect_key: effect_data[:effect_key])
        .update!(effect_data.merge(state: {}))
    end
  end

  kethra = demo.characters.find_by!(name: "Kethra Ironsong")
  draft_state = {
    from_level: 3,
    to_level: 4,
    completed_choices: 3,
    total_choices: 5,
    next_step: "ability_score_or_feat",
  }
  demo.character_drafts.find_or_initialize_by(character: kethra).update!(
    kind: "level_up",
    base_character_lock_version: kethra.lock_version,
    state: draft_state
  )
end

puts "Seeded demo@example.test with #{demo.characters.count} characters."
puts "Development bearer token: #{demo_token}"
