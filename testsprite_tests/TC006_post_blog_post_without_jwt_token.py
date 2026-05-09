import requests

def test_post_blog_post_without_jwt_token():
    base_url = "http://localhost:8000"
    url = f"{base_url}/blog/post"
    # Prepare form-data payload with minimum required fields
    data = {
        "title": "Unauthorized Post",
        "content": "This post should not be created because the request has no JWT token."
    }
    try:
        response = requests.post(url, data=data, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}"
    try:
        json_response = response.json()
    except ValueError:
        json_response = None

    # Optional: assert common unauthorized error structure or message if any
    if json_response and isinstance(json_response, dict):
        # Typical error message key check, if present
        assert any(key in json_response for key in ["error", "message", "detail"]), "Unauthorized error body missing expected keys"

test_post_blog_post_without_jwt_token()