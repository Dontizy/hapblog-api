import requests

BASE_URL = "http://localhost:8000"
LOGIN_ENDPOINT = "/user/login"
TIMEOUT = 30

def test_post_user_login_with_valid_credentials():
    url = BASE_URL + LOGIN_ENDPOINT
    payload = {
        "email": "testuser@example.com",
        "password": "ValidPassword123!"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status 200 but got {response.status_code}"

    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not a valid JSON"

    assert "user" in data, "Response JSON does not contain 'user'"
    assert "token" in data, "Response JSON does not contain 'token'"
    assert isinstance(data["token"], str) and len(data["token"]) > 0, "JWT token is empty or invalid"

test_post_user_login_with_valid_credentials()