
# TestSprite AI Testing Report(MCP)

---

## 1️⃣ Document Metadata
- **Project Name:** blog-api
- **Date:** 2026-05-09
- **Prepared by:** TestSprite AI Team

---

## 2️⃣ Requirement Validation Summary

#### Test TC001 post user register with valid data
- **Test Code:** [TC001_post_user_register_with_valid_data.py](./TC001_post_user_register_with_valid_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/98961430-1508-4b63-bddb-50eb8073bfb1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC002 post user register with existing email
- **Test Code:** [TC002_post_user_register_with_existing_email.py](./TC002_post_user_register_with_existing_email.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/d057191c-33e4-4850-ba87-3007eb1afbf1
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC003 post user login with valid credentials
- **Test Code:** [TC003_post_user_login_with_valid_credentials.py](./TC003_post_user_login_with_valid_credentials.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 33, in <module>
  File "<string>", line 22, in test_post_user_login_with_valid_credentials
AssertionError: Expected status 200 but got 401

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/8e0963a0-d893-497b-85ec-75cc944cae43
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC004 post user login with invalid credentials
- **Test Code:** [TC004_post_user_login_with_invalid_credentials.py](./TC004_post_user_login_with_invalid_credentials.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/f05c2f05-ad4f-41ce-bdad-0a9c5474c22b
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC005 post blog post with valid jwt and data
- **Test Code:** [TC005_post_blog_post_with_valid_jwt_and_data.py](./TC005_post_blog_post_with_valid_jwt_and_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/34d4a57e-3084-464c-8574-d2eafbcf9b29
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC006 post blog post without jwt token
- **Test Code:** [TC006_post_blog_post_without_jwt_token.py](./TC006_post_blog_post_without_jwt_token.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/3154b26a-44e2-428d-8e12-537c75c12b92
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC007 put blog post by author with valid data
- **Test Code:** [TC007_put_blog_post_by_author_with_valid_data.py](./TC007_put_blog_post_by_author_with_valid_data.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/e6aa6bc9-b334-4fa3-a2e1-c07e78f99385
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC008 put blog post by non author user
- **Test Code:** [TC008_put_blog_post_by_non_author_user.py](./TC008_put_blog_post_by_non_author_user.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 64, in <module>
  File "<string>", line 52, in test_put_blog_post_by_non_author_user
AssertionError: Expected 403 Forbidden but got 401 - {"message":"Invalid token","stack":"Error: Invalid token\n    at <anonymous> (/home/nelson/Documents/express-app/blog-api/src/middleware/authMiddleware.ts:35:13)\n    at <anonymous> (/home/nelson/Documents/express-app/blog-api/src/utils/asyncHandler.ts:4:41)\n    at Layer.handleRequest (/home/nelson/Documents/express-app/blog-api/node_modules/router/lib/layer.js:152:17)\n    at next (/home/nelson/Documents/express-app/blog-api/node_modules/router/lib/route.js:157:13)\n    at Route.dispatch (/home/nelson/Documents/express-app/blog-api/node_modules/router/lib/route.js:117:3)\n    at handle (/home/nelson/Documents/express-app/blog-api/node_modules/router/index.js:435:11)\n    at Layer.handleRequest (/home/nelson/Documents/express-app/blog-api/node_modules/router/lib/layer.js:152:17)\n    at /home/nelson/Documents/express-app/blog-api/node_modules/router/index.js:295:15\n    at param (/home/nelson/Documents/express-app/blog-api/node_modules/router/index.js:600:14)\n    at param (/home/nelson/Documents/express-app/blog-api/node_modules/router/index.js:610:14)"}

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/a0fa5157-6bce-422c-b420-78701f97aa07
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC009 delete blog post by author or admin
- **Test Code:** [TC009_delete_blog_post_by_author_or_admin.py](./TC009_delete_blog_post_by_author_or_admin.py)
- **Test Error:** Traceback (most recent call last):
  File "/var/task/handler.py", line 258, in run_with_retry
    exec(code, exec_env)
  File "<string>", line 51, in <module>
  File "<string>", line 37, in test_delete_blog_post_by_author_or_admin
AssertionError: Deleted post response missing _id

- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/ca953a75-c175-426c-a0fc-5d88e343cbca
- **Status:** ❌ Failed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---

#### Test TC010 get api docs swagger ui page
- **Test Code:** [TC010_get_api_docs_swagger_ui_page.py](./TC010_get_api_docs_swagger_ui_page.py)
- **Test Visualization and Result:** https://www.testsprite.com/dashboard/mcp/tests/3bd67d71-a5c0-4e47-af4e-ade04da3f9ba/4b72d2de-3aee-4959-8da8-f1b2ae265867
- **Status:** ✅ Passed
- **Analysis / Findings:** {{TODO:AI_ANALYSIS}}.
---


## 3️⃣ Coverage & Matching Metrics

- **70.00** of tests passed

| Requirement        | Total Tests | ✅ Passed | ❌ Failed  |
|--------------------|-------------|-----------|------------|
| ...                | ...         | ...       | ...        |
---


## 4️⃣ Key Gaps / Risks
{AI_GNERATED_KET_GAPS_AND_RISKS}
---