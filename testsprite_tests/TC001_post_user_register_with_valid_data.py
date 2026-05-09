import requests

def test_post_user_register_with_valid_data():
    base_url = "http://localhost:8000"
    url = f"{base_url}/user/register"
    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo",
        "Content-Type": "application/json"
    }
    payload = {
        "name": "Test User",
        "email": "testuser_t001@example.com",
        "password": "StrongPassword123!"
    }

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        assert response.status_code == 201, f"Expected status 201 but got {response.status_code}"
        response_json = response.json()
        assert "user" in response_json, "Response JSON missing 'user'"
        assert "token" in response_json, "Response JSON missing 'token'"
        assert isinstance(response_json["token"], str) and len(response_json["token"]) > 0, "Token is invalid"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_user_register_with_valid_data()