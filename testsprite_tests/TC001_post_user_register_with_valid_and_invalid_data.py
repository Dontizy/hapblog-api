import requests
import uuid

BASE_URL = "http://localhost:8000"
REGISTER_ENDPOINT = f"{BASE_URL}/user/register"
TIMEOUT = 30


def test_post_user_register_with_valid_and_invalid_data():
    # Valid user data for registration
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    valid_user = {
        "name": "Test User",
        "email": unique_email,
        "password": "StrongPassword123!"
    }

    # 1) Test successful registration with valid data
    try:
        response = requests.post(REGISTER_ENDPOINT, json=valid_user, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed during valid registration: {e}"
    assert response.status_code == 201, f"Expected 201, got {response.status_code}"
    json_resp = response.json()
    assert "user" in json_resp, "Response missing 'user' key"
    assert "token" in json_resp, "Response missing 'token' key"
    user_data = json_resp["user"]
    # Validate returned user fields
    assert isinstance(user_data.get("name"), str) and user_data["name"] == valid_user["name"]
    assert isinstance(user_data.get("email"), str) and user_data["email"] == valid_user["email"]
    assert isinstance(json_resp["token"], str) and len(json_resp["token"]) > 0

    # 2) Test duplicate email registration (should return 409)
    try:
        resp_dup = requests.post(REGISTER_ENDPOINT, json=valid_user, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed during duplicate email test: {e}"
    assert resp_dup.status_code == 409, f"Expected 409, got {resp_dup.status_code}"
    # Response body likely contains error message string
    dup_json = resp_dup.json() if resp_dup.headers.get("Content-Type", "").startswith("application/json") else None
    if dup_json:
        assert ("error" in dup_json or "message" in dup_json), "409 response missing error/message field"

    # 3) Test missing fields: missing email
    invalid_no_email = {
        "name": "No Email User",
        "password": "SomePassword123"
    }
    try:
        resp_no_email = requests.post(REGISTER_ENDPOINT, json=invalid_no_email, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed during missing email test: {e}"
    assert resp_no_email.status_code == 400, f"Expected 400, got {resp_no_email.status_code}"
    err_json = resp_no_email.json() if resp_no_email.headers.get("Content-Type", "").startswith("application/json") else None
    if err_json:
        assert ("error" in err_json or "message" in err_json or "errors" in err_json), "400 response missing validation error info"

    # 4) Test invalid email format
    invalid_bad_email = {
        "name": "Bad Email User",
        "email": "invalid-email-format",
        "password": "Password123"
    }
    try:
        resp_bad_email = requests.post(REGISTER_ENDPOINT, json=invalid_bad_email, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed during invalid email format test: {e}"
    assert resp_bad_email.status_code == 400, f"Expected 400, got {resp_bad_email.status_code}"
    err_json = resp_bad_email.json() if resp_bad_email.headers.get("Content-Type", "").startswith("application/json") else None
    if err_json:
        assert ("error" in err_json or "message" in err_json or "errors" in err_json), "400 response missing validation error info"

    # 5) Test missing password
    invalid_no_password = {
        "name": "No Password User",
        "email": f"nopassword_{uuid.uuid4().hex[:8]}@example.com"
    }
    try:
        resp_no_password = requests.post(REGISTER_ENDPOINT, json=invalid_no_password, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed during missing password test: {e}"
    assert resp_no_password.status_code == 400, f"Expected 400, got {resp_no_password.status_code}"
    err_json = resp_no_password.json() if resp_no_password.headers.get("Content-Type", "").startswith("application/json") else None
    if err_json:
        assert ("error" in err_json or "message" in err_json or "errors" in err_json), "400 response missing validation error info"


test_post_user_register_with_valid_and_invalid_data()