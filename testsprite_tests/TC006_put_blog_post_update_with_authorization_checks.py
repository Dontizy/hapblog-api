import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30


def register_user(name, email, password):
    url = f"{BASE_URL}/user/register"
    payload = {"name": name, "email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    user = data["user"]
    user_id = user.get("_id") or user.get("id")
    assert user_id is not None, "User id not found in response"
    return user_id, data["token"]


def create_blog_post(token, title, content):
    url = f"{BASE_URL}/blog/post"
    headers = {"Authorization": f"Bearer {token}"}
    files = {
        "title": (None, title),
        "content": (None, content)
    }
    resp = requests.post(url, files=files, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()  # should contain created blog post details including id


def delete_blog_post(token, post_id):
    url = f"{BASE_URL}/blog/post/{post_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    assert resp.status_code in (200, 404)


def test_put_blog_post_update_with_authorization_checks():
    # Register an author user to get a valid token
    author_email = "authoruser@example.com"
    author_password = "AuthorPass123!"
    try:
        _, author_token = register_user("Author User", author_email, author_password)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            # User exists, login instead
            login_url = f"{BASE_URL}/user/login"
            login_payload = {"email": author_email, "password": author_password}
            login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
            login_resp.raise_for_status()
            data = login_resp.json()
            author_token = data.get("token")
            assert author_token is not None, "Token not found in login response"
        else:
            raise

    # Register a non-author user to get a valid token for unauthorized update test
    non_author_email = "nonauthor@example.com"
    non_author_password = "NonAuthorPass123!"
    try:
        _, non_author_token = register_user("Non Author", non_author_email, non_author_password)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            login_url = f"{BASE_URL}/user/login"
            login_payload = {"email": non_author_email, "password": non_author_password}
            login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
            login_resp.raise_for_status()
            data = login_resp.json()
            non_author_token = data.get("token")
            assert non_author_token is not None, "Token not found in login response"
        else:
            raise

    # Create a blog post under author_token
    blog_post = None
    post_id = None
    try:
        # Create blog post
        blog_post_resp = create_blog_post(author_token, "Original Title", "Original content.")
        post_id = blog_post_resp.get("id") or blog_post_resp.get("_id")
        assert post_id is not None, "Blog post id not found in create response"

        # 1. PUT with author token should succeed
        update_url = f"{BASE_URL}/blog/post/{post_id}"
        headers_author = {"Authorization": f"Bearer {author_token}"}
        update_data = {
            "title": (None, "Updated Title"),
            "content": (None, "Updated content.")
        }
        resp = requests.put(update_url, files=update_data, headers=headers_author, timeout=TIMEOUT)
        assert resp.status_code == 200
        updated_post = resp.json()
        assert updated_post.get("title") == "Updated Title"
        assert updated_post.get("content") == "Updated content."

        # 2. PUT with non-author token should be forbidden (403)
        headers_non_author = {"Authorization": f"Bearer {non_author_token}"}
        resp = requests.put(update_url, files=update_data, headers=headers_non_author, timeout=TIMEOUT)
        assert resp.status_code == 403

        # 3. PUT with missing auth should be unauthorized (401)
        resp = requests.put(update_url, files=update_data, timeout=TIMEOUT)
        assert resp.status_code == 401

    finally:
        # Cleanup - delete blog post
        try:
            if post_id:
                delete_blog_post(author_token, post_id)
        except Exception:
            pass


test_put_blog_post_update_with_authorization_checks()
