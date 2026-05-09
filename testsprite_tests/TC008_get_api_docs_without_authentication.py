import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_api_docs_without_authentication():
    url = f"{BASE_URL}/api-docs"
    try:
        response = requests.get(url, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
        # Check if the response contains Swagger UI content indicators
        content = response.text
        assert "Swagger UI" in content or "swagger-ui" in content.lower(), "Swagger UI page not found in response"
        assert "<html" in content.lower() and "</html>" in content.lower(), "Response is not an HTML page"
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_get_api_docs_without_authentication()