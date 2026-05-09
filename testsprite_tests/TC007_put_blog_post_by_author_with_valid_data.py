import requests

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
TIMEOUT = 30

def test_put_blog_post_by_author_with_valid_data():
    # First create a blog post to update
    create_url = f"{BASE_URL}/blog/post"
    create_data = {
        "title": "Original Title",
        "content": "Original content of the blog post."
    }
    # No image upload is mandatory for creation, so no files provided
    try:
        # Create blog post
        create_response = requests.post(
            create_url, headers=HEADERS, data=create_data, timeout=TIMEOUT
        )
        assert create_response.status_code == 201, f"Expected 201, got {create_response.status_code}"
        created_post = create_response.json()
        post_id = created_post.get("id") or created_post.get("_id")
        assert post_id, "Created post ID not found in response"

        # Prepare updated data
        update_url = f"{BASE_URL}/blog/post/{post_id}"
        update_data = {
            "title": "Updated Title",
            "content": "Updated content of the blog post."
        }

        # Perform PUT request to update the blog post
        update_response = requests.put(
            update_url, headers=HEADERS, data=update_data, timeout=TIMEOUT
        )
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        updated_post = update_response.json()
        # Validate the updated fields match what we sent
        assert updated_post.get("title") == update_data["title"], "Title was not updated correctly"
        assert updated_post.get("content") == update_data["content"], "Content was not updated correctly"
        assert updated_post.get("id") == post_id or updated_post.get("_id") == post_id, "Updated post ID mismatch"

    finally:
        # Clean up by deleting the post created for test
        if 'post_id' in locals():
            delete_url = f"{BASE_URL}/blog/post/{post_id}"
            try:
                delete_response = requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)
                # Accept 200 if deleted, or 404 if already deleted
                assert delete_response.status_code in (200, 404), f"Unexpected delete status {delete_response.status_code}"
            except Exception:
                pass

test_put_blog_post_by_author_with_valid_data()