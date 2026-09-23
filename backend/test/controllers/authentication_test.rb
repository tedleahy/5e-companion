require "test_helper"

class AuthenticationProbeController < ApplicationController
  def index
    render json: {
      user_id: Current.user.id,
      session_id: Current.session.id,
    }
  end
end

class AuthenticationTest < ActionController::TestCase
  tests AuthenticationProbeController

  setup do
    Current.reset

    @routes = ActionDispatch::Routing::RouteSet.new
    @routes.draw do
      get "authentication_probe", to: "authentication_probe#index"
    end

    @current_user = users(:one)
    @token = "authentication-test-token"
    @session = @current_user.sessions.create!(
      token_digest: Digest::SHA256.hexdigest(@token),
      expires_at: nil,
    )
  end

  teardown do
    Current.reset
  end

  test "accepts valid sessions and rejects invalid credentials" do
    [ nil, 1.hour.from_now ].each do |expiry|
      @session.update!(expires_at: expiry)
      @request.headers["Authorization"] = "Bearer #{@token}"

      get :index

      assert_response :ok
      assert_equal @current_user.id, response.parsed_body["user_id"]
      assert_equal @session.id, response.parsed_body["session_id"]
    end

    [ nil, "Bearer", "Basic #{@token}", "Bearer unknown" ].each do |header|
      Current.reset
      @request.headers["Authorization"] = header

      get :index

      assert_unauthorized
    end

    freeze_time do
      @session.update!(expires_at: Time.current)
      @request.headers["Authorization"] = "Bearer #{@token}"

      Current.reset

      get :index

      assert_unauthorized
    end
  end

  private

  def assert_unauthorized
    assert_response :unauthorized

    expected_body = {
      "error" => {
        "code" => "unauthorized",
        "message" => "A valid bearer token is required.",
      },
    }

    assert_equal(expected_body, response.parsed_body)

    assert_nil Current.user
    assert_nil Current.session
  end
end
