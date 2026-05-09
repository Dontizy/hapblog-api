import requests

BASE_URL = "http://localhost:8000"
JWT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo"

def test_post_blog_post_with_valid_jwt_and_data():
    url = f"{BASE_URL}/blog/post"
    headers = {
        "Authorization": f"Bearer {JWT_TOKEN}"
    }
    files = {
        'image': ('test-image.jpg', b'test image content', 'image/jpeg')
    }
    data = {
        "title": "Test Blog Post Title TC005",
        "content": "This is the content of the test blog post for test case TC005."
    }
    try:
        response = requests.post(url, headers=headers, data=data, files=files, timeout=30)
        assert response.status_code == 201, f"Expected status 201 but got {response.status_code}"
        json_response = response.json()
        assert "title" in json_response and json_response["title"] == data["title"]
        assert "content" in json_response and json_response["content"] == data["content"]
        assert "_id" in json_response and isinstance(json_response["_id"], str)
    finally:
        # Cleanup: delete the created blog post if post was created
        if 'json_response' in locals() and "_id" in json_response:
            delete_url = f"{BASE_URL}/blog/post/{json_response['_id']}"
            requests.delete(delete_url, headers=headers, timeout=30)

test_post_blog_post_with_valid_jwt_and_data()