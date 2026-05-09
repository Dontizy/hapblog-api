import requests

def test_post_user_login_with_invalid_credentials():
    base_url = "http://localhost:8000"
    url = f"{base_url}/user/login"

    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo",
        "Content-Type": "application/json"
    }

    payloads = [
        {"email": "invalidemail@example.com", "password": "somepassword"},
        {"email": "user@example.com", "password": "wrongpassword"},
        {"email": "wrong@example.com", "password": "wrongpassword"}
    ]

    for payload in payloads:
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
        except requests.RequestException as e:
            assert False, f"Request failed: {e}"

        assert response.status_code == 401, f"Expected status 401, got {response.status_code}"
        try:
            resp_json = response.json()
        except ValueError:
            assert False, "Response is not in JSON format"

        assert "invalid" in str(resp_json).lower() or "unauthorized" in str(resp_json).lower(), (
            f"Response does not indicate invalid credentials error: {resp_json}"
        )

test_post_user_login_with_invalid_credentials()