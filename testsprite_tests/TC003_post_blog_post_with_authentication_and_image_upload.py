import requests
import io

BASE_URL = "http://localhost:8000"
JWT_TOKEN = "yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODI1ODIxNSwiZXhwIjoxNzc4MzQ0NjE1fQ.vOLbwTXsf3k-yF-7zX5IfDn4MTfSTVQuWUTARoK_Aws"

def test_post_blog_post_with_auth_and_image_upload():
    headers_auth = {
        "Authorization": f"Bearer {JWT_TOKEN}"
    }

    # Prepare valid form-data for blog post creation including image
    title = "Test Blog Post Title"
    content = "This is the content of the test blog post."
    image_content = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00"  # Minimal PNG header bytes for test
    files = {
        "image": ("test.png", io.BytesIO(image_content), "image/png")
    }
    data_valid = {
        "title": title,
        "content": content
    }

    # 1) Test POST /blog/post with valid JWT and valid form-data including image (expect 201)
    blog_post_id = None
    try:
        response = requests.post(
            f"{BASE_URL}/blog/post",
            headers=headers_auth,
            data=data_valid,
            files=files,
            timeout=30
        )
        assert response.status_code == 201, f"Expected 201 Created, got {response.status_code}"
        json_resp = response.json()
        assert "id" in json_resp or "_id" in json_resp, "Response missing blog post ID"
        # Getting post id from either 'id' or '_id'
        blog_post_id = json_resp.get("id") or json_resp.get("_id")
        assert blog_post_id is not None, "Blog post ID is None"
        assert json_resp.get("title") == title, "Title mismatch in response"
        assert json_resp.get("content") == content, "Content mismatch in response"
        
        # 2) Test POST /blog/post without JWT token (expect 401 Unauthorized)
        response_no_auth = requests.post(
            f"{BASE_URL}/blog/post",
            data=data_valid,
            files=files,
            timeout=30
        )
        assert response_no_auth.status_code == 401, f"Expected 401 Unauthorized without token, got {response_no_auth.status_code}"

        # 3) Test POST /blog/post with invalid data (missing required fields, expect 400 Invalid request)
        invalid_data_cases = [
            {},  # Empty data
            {"title": ""},  # Missing content
            {"content": ""},  # Missing title
            {"title": "x" * 5001, "content": content},  # Possibly too long title if limits exist
        ]
        for invalid_data in invalid_data_cases:
            resp_invalid = requests.post(
                f"{BASE_URL}/blog/post",
                headers=headers_auth,
                data=invalid_data,
                timeout=30
            )
            assert resp_invalid.status_code == 400, f"Expected 400 Invalid request for data {invalid_data}, got {resp_invalid.status_code}"
    finally:
        # Cleanup: delete created blog post if exists
        if blog_post_id:
            requests.delete(
                f"{BASE_URL}/blog/post/{blog_post_id}",
                headers=headers_auth,
                timeout=30
            )


test_post_blog_post_with_auth_and_image_upload()