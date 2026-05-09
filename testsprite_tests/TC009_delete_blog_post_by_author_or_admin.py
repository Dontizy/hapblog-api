import requests

BASE_URL = "http://localhost:8000"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZmUxMTBiY2IxZjRmMzdiNjQzMGMyYSIsImlhdCI6MTc3ODMyNzE5NiwiZXhwIjoxNzc4NDEzNTk2fQ.e1HPRbTCgRz1bnbQjI6HsSA-Kd5kNwrVd290k5EB5mo"
HEADERS = {"Authorization": f"Bearer {TOKEN}"}
TIMEOUT = 30

def test_delete_blog_post_by_author_or_admin():
    # Step 1: Create a new blog post to delete later
    create_url = f"{BASE_URL}/blog/post"
    post_data = {
        "title": "TC009 Delete Test Post",
        "content": "Content for delete test case.",
    }
    
    try:
        # Create blog post
        create_resp = requests.post(create_url, headers=HEADERS, data=post_data, timeout=TIMEOUT)
        assert create_resp.status_code == 201, f"Expected status 201, got {create_resp.status_code}"
        created_post = create_resp.json()
        # The response likely returns the created post object directly or inside '{ post: {...} }'
        if 'post' in created_post and isinstance(created_post['post'], dict):
            post_obj = created_post['post']
        else:
            post_obj = created_post
        assert "_id" in post_obj, "Created post response missing _id"
        post_id = post_obj["_id"]
        
        # Step 2: Delete the created blog post with same author/admin token
        delete_url = f"{BASE_URL}/blog/post/{post_id}"
        delete_resp = requests.delete(delete_url, headers=HEADERS, timeout=TIMEOUT)
        assert delete_resp.status_code == 200, f"Expected status 200 on delete, got {delete_resp.status_code}"
        
        deleted_post = delete_resp.json()
        # Validate response contains deleted post info and post_id matches
        assert isinstance(deleted_post, dict), "Deleted post response is not a JSON object"
        assert "_id" in deleted_post, "Deleted post response missing _id"
        deleted_post_id = deleted_post["_id"]
        assert deleted_post_id == post_id, "Deleted post ID does not match"
    
        # Step 3: Verify the blog post no longer exists (should get 404)
        get_url = f"{BASE_URL}/blog/post/{post_id}"
        get_resp = requests.get(get_url, timeout=TIMEOUT)
        assert get_resp.status_code == 404, f"Expected status 404 for deleted post, got {get_resp.status_code}"
    
    finally:
        # Cleanup: Try to delete post if it still exists (in case delete failed)
        if 'post_id' in locals():
            requests.delete(f"{BASE_URL}/blog/post/{post_id}", headers=HEADERS, timeout=TIMEOUT)

test_delete_blog_post_by_author_or_admin()
