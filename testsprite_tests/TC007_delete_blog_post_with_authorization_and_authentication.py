import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Provided JWT tokens
author_admin_token = "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODI1ODIxNSwiZXhwIjoxNzc4MzQ0NjE1fQ.vOLbwTXsf3k-yF-7zX5IfDn4MTfSTVQuWUTARoK_Aws"

def register_user(name, email, password):
    url = f"{BASE_URL}/user/register"
    payload = {"name": name, "email": email, "password": password}
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    if resp.status_code == 201:
        json_resp = resp.json()
        assert "token" in json_resp and "user" in json_resp and "_id" in json_resp["user"], "Invalid register response format"
        return json_resp["token"], json_resp["user"]["_id"]
    elif resp.status_code == 409:
        # User exists, try login
        login_url = f"{BASE_URL}/user/login"
        login_payload = {"email": email.lower(), "password": password}
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        login_json = login_resp.json()
        assert "token" in login_json and "user" in login_json and "_id" in login_json["user"], "Invalid login response format"
        return login_json["token"], login_json["user"]["_id"]
    else:
        assert False, f"User registration failed with status {resp.status_code}"


def create_blog_post(token, title, content):
    url = f"{BASE_URL}/blog/post"
    headers = {"Authorization": f"Bearer {token}"}
    data = {"title": title, "content": content}
    resp = requests.post(url, headers=headers, data=data, timeout=TIMEOUT)
    resp.raise_for_status()
    json_resp = resp.json()
    post_id = json_resp.get("_id") or json_resp.get("id")
    assert post_id is not None, "Blog post creation did not return post id"
    return post_id


def delete_blog_post(token, post_id):
    url = f"{BASE_URL}/blog/post/{post_id}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    return requests.delete(url, headers=headers, timeout=TIMEOUT)


def test_delete_blog_post_with_authorization_and_authentication():
    # Step 1: Create a blog post with author/admin token to delete
    post_id = None
    non_author_token, non_author_user_id = register_user(
        "NonAuthorUser", "nonauthor@example.com", "TestPass123!"
    )
    assert non_author_token is not None, "Failed to obtain non-author user token"

    try:
        post_id = create_blog_post(
            author_admin_token, "Test Post for Delete", "Content for delete test"
        )
        assert post_id is not None, "Blog post creation failed"

        # Test delete with valid author/admin token (should succeed)
        del_resp = delete_blog_post(author_admin_token, post_id)
        assert del_resp.status_code == 200, f"Expected 200 on delete by author/admin, got {del_resp.status_code}"

        # Re-create post to test other cases
        post_id = create_blog_post(
            author_admin_token, "Test Post for Delete", "Content for delete test"
        )
        assert post_id is not None, "Blog post re-creation failed"

        # Test delete without authentication (should be 401)
        del_resp_no_auth = delete_blog_post(None, post_id)
        assert del_resp_no_auth.status_code == 401, f"Expected 401 on delete without auth, got {del_resp_no_auth.status_code}"

        # Test delete with non-author user token (should be 403)
        del_resp_non_author = delete_blog_post(non_author_token, post_id)
        assert del_resp_non_author.status_code == 403, f"Expected 403 on delete by non-author, got {del_resp_non_author.status_code}"

        # Cleanup: delete blog post with author/admin token
        del_resp_cleanup = delete_blog_post(author_admin_token, post_id)
        assert del_resp_cleanup.status_code == 200, f"Cleanup delete failed, got {del_resp_cleanup.status_code}"

        # Test delete non-existent post with valid token (404)
        non_existent_id = "507f1f77bcf86cd799439011"  # Valid MongoDB ObjectId format but assumed non-existent
        del_resp_404 = delete_blog_post(author_admin_token, non_existent_id)
        assert del_resp_404.status_code == 404, f"Expected 404 on deleting non-existent post, got {del_resp_404.status_code}"

    finally:
        # Cleanup: ensure post is deleted if it still exists
        if post_id:
            delete_blog_post(author_admin_token, post_id)


test_delete_blog_post_with_authorization_and_authentication()
