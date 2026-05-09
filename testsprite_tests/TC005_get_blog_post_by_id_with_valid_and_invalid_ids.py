import requests

BASE_URL = "http://localhost:8000"
TOKEN = "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODI1ODIxNSwiZXhwIjoxNzc4MzQ0NjE1fQ.vOLbwTXsf3k-yF-7zX5IfDn4MTfSTVQuWUTARoK_Aws"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}"
}

def test_get_blog_post_by_id_with_valid_and_invalid_ids():
    post_id = None
    # First, create a blog post to get a valid ID
    # Using the POST /blog/post endpoint with required fields and auth
    create_url = f"{BASE_URL}/blog/post"
    create_headers = HEADERS.copy()
    # Since image is optional, we'll send only title and content as form-data
    create_data = {
        "title": "Test Post for TC005",
        "content": "Content for test case TC005."
    }
    try:
        create_response = requests.post(create_url, headers=create_headers, data=create_data, timeout=30)
        assert create_response.status_code == 201, f"Blog post creation failed with status {create_response.status_code}"
        created_post = create_response.json()
        post_id = created_post.get("id") or created_post.get("_id")
        assert post_id is not None, "Created blog post does not contain an ID"
        
        # Test GET /blog/post/{id} with valid ID
        get_url = f"{BASE_URL}/blog/post/{post_id}"
        get_response = requests.get(get_url, timeout=30)
        assert get_response.status_code == 200, f"GET blog post with valid ID failed with status {get_response.status_code}"
        blog_post = get_response.json()
        # Validate that the returned blog post ID matches
        ret_id = blog_post.get("id") or blog_post.get("_id")
        assert ret_id == post_id, "Returned blog post ID does not match requested ID"
        assert "title" in blog_post and blog_post["title"] == create_data["title"], "Blog post title mismatch"
        assert "content" in blog_post and blog_post["content"] == create_data["content"], "Blog post content mismatch"
        
        # Test GET /blog/post/{id} with non-existent ID to verify 404
        invalid_id = "000000000000000000000000"  # Likely to not exist on MongoDB ObjectId
        invalid_get_url = f"{BASE_URL}/blog/post/{invalid_id}"
        invalid_response = requests.get(invalid_get_url, timeout=30)
        assert invalid_response.status_code == 404, f"GET blog post with invalid ID did not return 404 but {invalid_response.status_code}"
        try:
            err_body = invalid_response.json()
            # Optional: Check error message if API returns in a field such as "message"
            if isinstance(err_body, dict):
                assert "not found" in str(err_body).lower(), "Error message does not indicate 'not found'"
        except Exception:
            # If response is not JSON, just pass since status code 404 is enough validation
            pass
        
    finally:
        # Cleanup: delete the created post if it exists
        if post_id:
            delete_url = f"{BASE_URL}/blog/post/{post_id}"
            del_response = requests.delete(delete_url, headers=HEADERS, timeout=30)
            # We can assert delete success but not mandatory here; just ensure cleanup
            if del_response.status_code != 200:
                # Optionally print or log
                pass

test_get_blog_post_by_id_with_valid_and_invalid_ids()
