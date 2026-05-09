import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = f"{BASE_URL}/user/login"
TIMEOUT = 30


def test_post_user_login_with_valid_and_invalid_credentials():
    # Valid credentials (assuming test user exists; else register prior)
    valid_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    # Invalid credentials - wrong password
    invalid_credentials_payload = {
        "email": "testuser@example.com",
        "password": "WrongPassword"
    }
    # Missing email field
    missing_email_payload = {
        "password": "TestPassword123!"
    }
    # Missing password field
    missing_password_payload = {
        "email": "testuser@example.com"
    }
    # Invalid email format
    invalid_email_format_payload = {
        "email": "invalid-email-format",
        "password": "TestPassword123!"
    }
    headers = {
        "Content-Type": "application/json"
    }

    # Test valid credentials
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=valid_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 200, f"Expected 200 for valid login, got {response.status_code}"
    json_data = response.json()
    assert "user" in json_data, "Response JSON missing 'user'"
    assert "token" in json_data, "Response JSON missing 'token'"
    assert isinstance(json_data["token"], str) and json_data["token"], "Token should be a non-empty string"

    # Test invalid credentials (wrong password)
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=invalid_credentials_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 401, f"Expected 401 for invalid credentials, got {response.status_code}"
    json_data = response.json()
    assert "message" in json_data or "error" in json_data, "Response JSON should contain error message"

    # Test missing email field (400 validation error)
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=missing_email_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 400, f"Expected 400 for missing email, got {response.status_code}"
    json_data = response.json()
    assert "message" in json_data or "errors" in json_data, "Response JSON should contain validation error message"

    # Test missing password field (400 validation error)
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=missing_password_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 400, f"Expected 400 for missing password, got {response.status_code}"
    json_data = response.json()
    assert "message" in json_data or "errors" in json_data, "Response JSON should contain validation error message"

    # Test invalid email format (400 validation error)
    try:
        response = requests.post(
            LOGIN_ENDPOINT,
            json=invalid_email_format_payload,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request failed with exception: {e}"
    assert response.status_code == 400, f"Expected 400 for invalid email format, got {response.status_code}"
    json_data = response.json()
    assert "message" in json_data or "errors" in json_data, "Response JSON should contain validation error message"


test_post_user_login_with_valid_and_invalid_credentials()