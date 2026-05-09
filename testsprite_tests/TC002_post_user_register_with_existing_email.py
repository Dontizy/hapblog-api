import requests

def test_post_user_register_with_existing_email():
    base_url = "http://localhost:8000"
    register_url = f"{base_url}/user/register"
    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo",
        "Content-Type": "application/json"
    }

    # Use a fixed email assumed to already exist
    existing_user = {
        "name": "Existing User",
        "email": "existinguser@example.com",
        "password": "AnyPassword123!"
    }

    try:
        # First try to ensure the user exists - register user if not exists
        # Although auth_required is false for register, include header anyway for test completeness
        resp = requests.post(register_url, json=existing_user, headers=headers, timeout=30)
        # User might be created or might already exist, ignore result here; just make sure user exists for test
        
        # Now call again to test conflict on existing email
        conflict_response = requests.post(register_url, json=existing_user, headers=headers, timeout=30)

        assert conflict_response.status_code == 409, f"Expected status 409, got {conflict_response.status_code}"
        # The response content should indicate user already exists
        resp_json = conflict_response.json()
        assert "already exists" in str(resp_json).lower(), f"Expected user already exists error, got {resp_json}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_post_user_register_with_existing_email()