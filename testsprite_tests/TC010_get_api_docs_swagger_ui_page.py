import requests

def test_get_api_docs_swagger_ui_page():
    base_url = "http://localhost:8000"
    endpoint = "/api-docs"
    url = base_url + endpoint
    headers = {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo"
    }
    try:
        response = requests.get(url, headers=headers, timeout=30)
        assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
        content_type = response.headers.get("Content-Type", "")
        assert "text/html" in content_type or "application/json" in content_type, f"Expected HTML or JSON content type, got {content_type}"
        body = response.text
        assert "swagger" in body.lower() or "swagger-ui" in body.lower() or "openapi" in body.lower(), "Response body does not seem to contain Swagger UI content"
    except requests.RequestException as e:
        assert False, f"Request to {url} failed with exception: {e}"

test_get_api_docs_swagger_ui_page()