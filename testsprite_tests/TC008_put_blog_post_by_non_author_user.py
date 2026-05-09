import requests

base_url = "http://localhost:8000"
author_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo"
non_author_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYzYiLCJpYXQiOjE3NzgzMjcxOTYsImV4cCI6MTc3ODQxMzU5Nn0.dummyvalidnonauthortoken1234567890abcdef"  # valid token format with different user id

author_headers = {"Authorization": f"Bearer {author_token}"}
non_author_headers = {"Authorization": f"Bearer {non_author_token}"}

def test_put_blog_post_by_non_author_user():
    # Create a blog post as the author
    create_data = {
        "title": "Test Post Title",
        "content": "Test post content."
    }
    create_response = requests.post(
        f"{base_url}/blog/post",
        headers=author_headers,
        files={
            "title": (None, create_data["title"]),
            "content": (None, create_data["content"])
        },
        timeout=30
    )
    assert create_response.status_code == 201, f"Blog post creation failed: {create_response.text}"
    response_json = create_response.json()
    post_id = response_json.get("_id") or response_json.get("id")
    if not post_id and isinstance(response_json, dict):
        for key in response_json:
            if isinstance(response_json[key], dict):
                post_id = response_json[key].get("_id") or response_json[key].get("id")
                if post_id:
                    break
    assert post_id, "Could not retrieve post id from create response"

    try:
        # Attempt to update the post with non-author token
        update_data = {
            "title": "Updated Title Non-Author",
            "content": "Updated content by non-author user."
        }
        update_response = requests.put(
            f"{base_url}/blog/post/{post_id}",
            headers=non_author_headers,
            files={
                "title": (None, update_data["title"]),
                "content": (None, update_data["content"])
                # No image upload here, but if needed the key must be "imageUrl" per PRD
            },
            timeout=30
        )
        assert update_response.status_code == 403, (
            f"Expected 403 Forbidden but got {update_response.status_code} - {update_response.text}"
        )
    finally:
        # Clean up: delete the post as the author
        delete_response = requests.delete(
            f"{base_url}/blog/post/{post_id}",
            headers=author_headers,
            timeout=30
        )
        assert delete_response.status_code == 200, f"Failed to delete blog post: {delete_response.text}"

test_put_blog_post_by_non_author_user()