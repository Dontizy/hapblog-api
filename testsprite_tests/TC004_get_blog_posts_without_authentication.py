import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_get_blog_posts_without_authentication():
    url = f"{BASE_URL}/blog/posts"
    try:
        response = requests.get(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    try:
        posts = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert isinstance(posts, list), f"Expected a list of blog posts, got {type(posts)}"

test_get_blog_posts_without_authentication()