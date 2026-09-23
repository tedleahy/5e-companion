module Api
  module V1
    class CharactersController < ApplicationController
      def index
        query = params[:q]
        sort = params[:sort]
        sort = "level" if sort.nil? || sort == ""
        return render_invalid_query unless valid_query?(query, sort)

        query = query&.strip.presence
        characters = Current.user.characters
        characters = characters.named(query) if query
        characters = sort_characters(characters, sort).preload(:character_classes)
        drafts = Current.user.character_drafts.includes(:character).order(updated_at: :desc, id: :desc)

        render json: {
          characters: characters.map { |character| character_summary(character) },
          drafts: drafts.map { |draft| draft_summary(draft) },
        }
      end

      private

      # Checks whether the character-list query parameters are supported.
      # @param query [String, nil] the optional name filter
      # @param sort [String] the requested sort order
      # @return [Boolean] whether both parameters are valid
      def valid_query?(query, sort)
        (query.nil? || query.is_a?(String)) &&
          sort.is_a?(String) &&
          query.to_s.strip.length <= 100 &&
          %w[level name].include?(sort)
      end

      def render_invalid_query
        render json: {
          error: {
            code: "invalid_query",
            message: "Unsupported query parameters.",
          },
        }, status: :bad_request
      end

      def sort_characters(characters, sort)
        if sort == "name"
          characters.order(Arel.sql("LOWER(characters.name) ASC"), id: :asc)
        else
          characters
            .left_joins(:character_classes)
            .group("characters.id")
            .order(
              Arel.sql("COALESCE(SUM(character_classes.level), 0) DESC"),
              Arel.sql("LOWER(characters.name) ASC"),
              id: :asc,
            )
        end
      end

      def character_summary(character)
        {
          id: character.id.to_s,
          name: character.name,
          ancestry: {
            race_name: character.race_name,
            subrace_name: character.subrace_name,
          },
          classes: character.character_classes.sort_by(&:position).map do |character_class|
            {
              name: character_class.name,
              level: character_class.level,
              subclass_name: character_class.subclass_name,
            }
          end,
          total_level: character.total_level,
          hit_points: {
            current: character.current_hit_points,
            maximum: character.maximum_hit_points,
            temporary: character.temporary_hit_points,
          },
        }
      end

      def draft_summary(draft)
        case draft.kind
        when "creation"
          {
            id: draft.id.to_s,
            kind: draft.kind,
            name: draft.state["name"],
            completed_choices: draft.state.fetch("completed_choices"),
            total_choices: draft.state.fetch("total_choices"),
            next_step: draft.state.fetch("next_step"),
          }
        when "level_up"
          {
            id: draft.id.to_s,
            kind: draft.kind,
            character_id: draft.character_id.to_s,
            character_name: draft.character.name,
            from_level: draft.state.fetch("from_level"),
            to_level: draft.state.fetch("to_level"),
            completed_choices: draft.state.fetch("completed_choices"),
            total_choices: draft.state.fetch("total_choices"),
            next_step: draft.state.fetch("next_step"),
          }
        else
          raise ArgumentError, "Unsupported draft kind: #{draft.kind}"
        end
      end
    end
  end
end
