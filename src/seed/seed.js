"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var faker_1 = require("@faker-js/faker");
var bcryptjs_1 = require("bcryptjs");
require("dotenv/config");
var node_path_1 = require("node:path");
var node_url_1 = require("node:url");
var User_js_1 = require("../models/User.js");
var Blog_js_1 = require("../models/Blog.js");
var Comment_js_1 = require("../models/Comment.js");
var Reply_js_1 = require("../models/Reply.js");
var Category_js_1 = require("../models/Category.js");
var cloudinary_js_1 = require("../config/cloudinary.js");
var DB_URI = process.env.DB_URI;
if (!DB_URI) {
    throw new Error("DB_URI is not defined");
}
// --------------------------------------------------
// CONFIG
// --------------------------------------------------
var USER_COUNT = 30;
var BLOG_COUNT = 50;
var COMMENT_COUNT = 150;
var REPLY_COUNT = 200;
var SYSTEM_USER_EMAIL = "raphaeldonatus9@gmail.com";
// --------------------------------------------------
// PATH SETUP
// --------------------------------------------------
var __filename = (0, node_url_1.fileURLToPath)(import.meta.url);
var __dirname = node_path_1.default.dirname(__filename);
var SEED_IMAGES_DIR = node_path_1.default.join(__dirname, "../../seed-images");
var SEED_IMAGE_FILES = [
    "blog-1.jpg",
    "blog-2.jpg",
    "blog-3.jpg",
    "blog-4.jpg",
    "blog-5.jpg",
    "blog-6.jpg",
    "blog-7.png",
    "blog-8.png",
    "blog-9.png",
    "blog-10.png"
];
// --------------------------------------------------
// HELPERS
// --------------------------------------------------
var hashPassword = function (plainPassword) { return __awaiter(void 0, void 0, void 0, function () {
    var salt;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 1:
                salt = _a.sent();
                return [2 /*return*/, bcryptjs_1.default.hash(plainPassword, salt)];
        }
    });
}); };
var escapeHtml = function (value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};
var generateUsername = function () {
    var username = faker_1.faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");
    return "".concat(username, "_").concat(faker_1.faker.string.numeric(4));
};
var generateSlug = function (title, usedSlugs) {
    var baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
    var slug = baseSlug;
    var counter = 1;
    while (usedSlugs.has(slug)) {
        slug = "".concat(baseSlug, "-").concat(counter);
        counter++;
    }
    usedSlugs.add(slug);
    return slug;
};
// --------------------------------------------------
// CLOUDINARY SEED IMAGE UPLOAD
// --------------------------------------------------
var uploadSeedImage = function (filePath) { return __awaiter(void 0, void 0, Promise, function () {
    var result;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, cloudinary_js_1.default.uploader.upload(filePath, {
                    folder: "hapblog/seed",
                    resource_type: "image",
                })];
            case 1:
                result = _a.sent();
                return [2 /*return*/, result.secure_url];
        }
    });
}); };
var uploadSeedImages = function () { return __awaiter(void 0, void 0, Promise, function () {
    var uploadedImages, _i, SEED_IMAGE_FILES_1, filename, filePath, imageUrl;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Uploading seed images to Cloudinary...");
                uploadedImages = [];
                _i = 0, SEED_IMAGE_FILES_1 = SEED_IMAGE_FILES;
                _a.label = 1;
            case 1:
                if (!(_i < SEED_IMAGE_FILES_1.length)) return [3 /*break*/, 4];
                filename = SEED_IMAGE_FILES_1[_i];
                filePath = node_path_1.default.join(SEED_IMAGES_DIR, filename);
                console.log("Uploading ".concat(filename, "..."));
                return [4 /*yield*/, uploadSeedImage(filePath)];
            case 2:
                imageUrl = _a.sent();
                uploadedImages.push(imageUrl);
                console.log("Uploaded ".concat(filename));
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                console.log("Uploaded ".concat(uploadedImages.length, " seed images."));
                return [2 /*return*/, uploadedImages];
        }
    });
}); };
// --------------------------------------------------
// RICH TIPTAP CONTENT
// --------------------------------------------------
var generateRichContent = function (title, categoryName) {
    var intro1 = faker_1.faker.lorem.sentences({
        min: 2,
        max: 4,
    });
    var intro2 = faker_1.faker.lorem.sentences({
        min: 2,
        max: 4,
    });
    var paragraph1 = faker_1.faker.lorem.paragraph();
    var paragraph2 = faker_1.faker.lorem.paragraph();
    var paragraph3 = faker_1.faker.lorem.paragraph();
    var paragraph4 = faker_1.faker.lorem.paragraph();
    var paragraph5 = faker_1.faker.lorem.paragraph();
    var paragraph6 = faker_1.faker.lorem.paragraph();
    var listItems = Array.from({ length: 4 }, function () { return faker_1.faker.lorem.sentence(); });
    var numberedItems = Array.from({ length: 4 }, function () { return faker_1.faker.lorem.sentence(); });
    var quote = faker_1.faker.lorem.sentence({
        min: 8,
        max: 18,
    });
    var conclusion = faker_1.faker.lorem.sentences({
        min: 2,
        max: 4,
    });
    return "\n    <h2>".concat(escapeHtml(title), "</h2>\n\n    <p>\n      <strong>").concat(escapeHtml(categoryName), "</strong> is an area that\n      continues to influence how people think, work, learn, and\n      interact with the world around them.\n    </p>\n\n    <p>\n      ").concat(escapeHtml(intro1), "\n    </p>\n\n    <p>\n      ").concat(escapeHtml(intro2), "\n    </p>\n\n    <h2>Why this matters</h2>\n\n    <p>\n      ").concat(escapeHtml(paragraph1), "\n    </p>\n\n    <p>\n      ").concat(escapeHtml(paragraph2), "\n    </p>\n\n    <blockquote>\n      <p>\n        ").concat(escapeHtml(quote), "\n      </p>\n    </blockquote>\n\n    <h3>Important things to consider</h3>\n\n    <p>\n      ").concat(escapeHtml(paragraph3), "\n    </p>\n\n    <ul>\n      ").concat(listItems
        .map(function (item) { return "\n            <li>\n              <p>".concat(escapeHtml(item), "</p>\n            </li>\n          "); })
        .join(""), "\n    </ul>\n\n    <h3>A practical approach</h3>\n\n    <p>\n      ").concat(escapeHtml(paragraph4), "\n    </p>\n\n    <ol>\n      ").concat(numberedItems
        .map(function (item) { return "\n            <li>\n              <p>".concat(escapeHtml(item), "</p>\n            </li>\n          "); })
        .join(""), "\n    </ol>\n\n    <p>\n      ").concat(escapeHtml(paragraph5), "\n    </p>\n\n    <h2>What you should remember</h2>\n\n    <p>\n      ").concat(escapeHtml(paragraph6), "\n    </p>\n\n    <p>\n      You don't always need to make dramatic changes. Sometimes,\n      <strong>small and consistent improvements</strong> can produce\n      meaningful results over time.\n    </p>\n\n    <p>\n      ").concat(escapeHtml(conclusion), "\n    </p>\n\n    <hr>\n\n    <p>\n      <em>\n        What do you think about this topic? Share your thoughts in\n        the comments below.\n      </em>\n    </p>\n  ").trim();
};
// --------------------------------------------------
// MAIN SEED
// --------------------------------------------------
var seed = function () { return __awaiter(void 0, void 0, void 0, function () {
    var systemUser, categories_1, uploadedImages_1, password_1, users, createdUsers, contentUsers_2, _loop_1, _i, createdUsers_1, user, usedSlugs_1, blogs, createdBlogs, _a, createdBlogs_1, blog, likers, _b, contentUsers_1, user, publishedBlogs_1, bookmarks, publishedBlogs_2, comments, createdComments_2, _c, createdComments_1, comment, likers, replies, createdReplies, _d, createdReplies_1, reply, likers, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 35, , 36]);
                // --------------------------------------------------
                // CONNECT DATABASE
                // --------------------------------------------------
                return [4 /*yield*/, mongoose_1.default.connect(DB_URI)];
            case 1:
                // --------------------------------------------------
                // CONNECT DATABASE
                // --------------------------------------------------
                _e.sent();
                console.log("Connected to MongoDB");
                return [4 /*yield*/, User_js_1.default.findOne({
                        email: SYSTEM_USER_EMAIL,
                    })];
            case 2:
                systemUser = _e.sent();
                if (!systemUser) {
                    throw new Error("System user ".concat(SYSTEM_USER_EMAIL, " was not found."));
                }
                console.log("System user preserved: ".concat(systemUser.email));
                // --------------------------------------------------
                // CLEAR OLD SEED DATA
                // --------------------------------------------------
                console.log("Clearing old seed data...");
                // Replies first because they reference comments
                return [4 /*yield*/, Reply_js_1.default.deleteMany({})];
            case 3:
                // Replies first because they reference comments
                _e.sent();
                // Comments reference blogs
                return [4 /*yield*/, Comment_js_1.default.deleteMany({})];
            case 4:
                // Comments reference blogs
                _e.sent();
                // Delete all blogs
                return [4 /*yield*/, Blog_js_1.default.deleteMany({})];
            case 5:
                // Delete all blogs
                _e.sent();
                // Delete every user except system user
                return [4 /*yield*/, User_js_1.default.deleteMany({
                        _id: {
                            $ne: systemUser._id,
                        },
                    })];
            case 6:
                // Delete every user except system user
                _e.sent();
                console.log("Old users, blogs, comments and replies cleared.");
                // --------------------------------------------------
                // RESET SYSTEM USER RELATIONSHIPS
                // --------------------------------------------------
                systemUser.followers = [];
                systemUser.following = [];
                systemUser.bookmarks = [];
                return [4 /*yield*/, systemUser.save()];
            case 7:
                _e.sent();
                return [4 /*yield*/, Category_js_1.default.find({})];
            case 8:
                categories_1 = _e.sent();
                if (categories_1.length === 0) {
                    throw new Error("No categories found. Create your categories before running the seed.");
                }
                console.log("Found ".concat(categories_1.length, " categories."));
                return [4 /*yield*/, uploadSeedImages()];
            case 9:
                uploadedImages_1 = _e.sent();
                if (uploadedImages_1.length === 0) {
                    throw new Error("No seed images were uploaded.");
                }
                // --------------------------------------------------
                // USERS
                // --------------------------------------------------
                console.log("Creating Faker users...");
                return [4 /*yield*/, hashPassword("Password123!")];
            case 10:
                password_1 = _e.sent();
                users = Array.from({ length: USER_COUNT }, function () { return ({
                    name: faker_1.faker.person.fullName(),
                    username: generateUsername(),
                    email: faker_1.faker.internet
                        .email()
                        .toLowerCase(),
                    password: password_1,
                    role: "user",
                    avatar: faker_1.faker.image.avatar(),
                    bio: faker_1.faker.person.bio(),
                    followers: [],
                    following: [],
                    bookmarks: [],
                }); });
                return [4 /*yield*/, User_js_1.default.insertMany(users)];
            case 11:
                createdUsers = _e.sent();
                console.log("Created ".concat(createdUsers.length, " Faker users."));
                contentUsers_2 = __spreadArray([
                    systemUser
                ], createdUsers, true);
                // --------------------------------------------------
                // FOLLOWERS / FOLLOWING
                // --------------------------------------------------
                console.log("Creating follower/following relationships...");
                _loop_1 = function (user) {
                    var possibleUsers, followingUsers, _f, followingUsers_1, followedUser;
                    return __generator(this, function (_g) {
                        switch (_g.label) {
                            case 0:
                                possibleUsers = contentUsers_2.filter(function (other) {
                                    return !other._id.equals(user._id);
                                });
                                followingUsers = faker_1.faker.helpers.arrayElements(possibleUsers, faker_1.faker.number.int({
                                    min: 0,
                                    max: Math.min(10, possibleUsers.length),
                                }));
                                user.following =
                                    followingUsers.map(function (other) { return other._id; });
                                return [4 /*yield*/, user.save()];
                            case 1:
                                _g.sent();
                                _f = 0, followingUsers_1 = followingUsers;
                                _g.label = 2;
                            case 2:
                                if (!(_f < followingUsers_1.length)) return [3 /*break*/, 5];
                                followedUser = followingUsers_1[_f];
                                return [4 /*yield*/, User_js_1.default.findByIdAndUpdate(followedUser._id, {
                                        $addToSet: {
                                            followers: user._id,
                                        },
                                    })];
                            case 3:
                                _g.sent();
                                _g.label = 4;
                            case 4:
                                _f++;
                                return [3 /*break*/, 2];
                            case 5: return [2 /*return*/];
                        }
                    });
                };
                _i = 0, createdUsers_1 = createdUsers;
                _e.label = 12;
            case 12:
                if (!(_i < createdUsers_1.length)) return [3 /*break*/, 15];
                user = createdUsers_1[_i];
                return [5 /*yield**/, _loop_1(user)];
            case 13:
                _e.sent();
                _e.label = 14;
            case 14:
                _i++;
                return [3 /*break*/, 12];
            case 15:
                console.log("Follower/following relationships created.");
                // --------------------------------------------------
                // BLOGS
                // --------------------------------------------------
                console.log("Creating rich blog posts...");
                usedSlugs_1 = new Set();
                blogs = Array.from({ length: BLOG_COUNT }, function () {
                    var author = faker_1.faker.helpers.arrayElement(contentUsers_2);
                    var category = faker_1.faker.helpers.arrayElement(categories_1);
                    var title = faker_1.faker.lorem.sentence({
                        min: 5,
                        max: 12,
                    });
                    var slug = generateSlug(title, usedSlugs_1);
                    var status = faker_1.faker.helpers.arrayElement([
                        "published",
                        "published",
                        "published",
                        "draft",
                    ]);
                    return {
                        title: title,
                        slug: slug,
                        content: generateRichContent(title, category.name),
                        // Cloudinary image
                        imageUrl: faker_1.faker.helpers.arrayElement(uploadedImages_1),
                        author: author._id,
                        category: category._id,
                        status: status,
                        likes: [],
                    };
                });
                return [4 /*yield*/, Blog_js_1.default.insertMany(blogs)];
            case 16:
                createdBlogs = _e.sent();
                console.log("Created ".concat(createdBlogs.length, " rich blogs."));
                // --------------------------------------------------
                // BLOG LIKES
                // --------------------------------------------------
                console.log("Creating blog likes...");
                _a = 0, createdBlogs_1 = createdBlogs;
                _e.label = 17;
            case 17:
                if (!(_a < createdBlogs_1.length)) return [3 /*break*/, 20];
                blog = createdBlogs_1[_a];
                likers = faker_1.faker.helpers.arrayElements(contentUsers_2, faker_1.faker.number.int({
                    min: 0,
                    max: Math.min(15, contentUsers_2.length),
                }));
                blog.likes =
                    likers.map(function (user) { return user._id; });
                return [4 /*yield*/, blog.save()];
            case 18:
                _e.sent();
                _e.label = 19;
            case 19:
                _a++;
                return [3 /*break*/, 17];
            case 20:
                console.log("Blog likes created.");
                // --------------------------------------------------
                // BOOKMARKS
                // --------------------------------------------------
                console.log("Creating bookmarks...");
                _b = 0, contentUsers_1 = contentUsers_2;
                _e.label = 21;
            case 21:
                if (!(_b < contentUsers_1.length)) return [3 /*break*/, 24];
                user = contentUsers_1[_b];
                publishedBlogs_1 = createdBlogs.filter(function (blog) {
                    return blog.status ===
                        "published";
                });
                bookmarks = faker_1.faker.helpers.arrayElements(publishedBlogs_1, faker_1.faker.number.int({
                    min: 0,
                    max: Math.min(10, publishedBlogs_1.length),
                }));
                user.bookmarks =
                    bookmarks.map(function (blog) { return blog._id; });
                return [4 /*yield*/, user.save()];
            case 22:
                _e.sent();
                _e.label = 23;
            case 23:
                _b++;
                return [3 /*break*/, 21];
            case 24:
                console.log("Bookmarks created.");
                // --------------------------------------------------
                // COMMENTS
                // --------------------------------------------------
                console.log("Creating comments...");
                publishedBlogs_2 = createdBlogs.filter(function (blog) {
                    return blog.status ===
                        "published";
                });
                comments = Array.from({
                    length: COMMENT_COUNT,
                }, function () {
                    var author = faker_1.faker.helpers.arrayElement(contentUsers_2);
                    var blog = faker_1.faker.helpers.arrayElement(publishedBlogs_2);
                    return {
                        author: author._id,
                        blog: blog._id,
                        body: faker_1.faker.lorem.sentences({
                            min: 1,
                            max: 4,
                        }),
                        likes: [],
                    };
                });
                return [4 /*yield*/, Comment_js_1.default.insertMany(comments)];
            case 25:
                createdComments_2 = _e.sent();
                console.log("Created ".concat(createdComments_2.length, " comments."));
                // --------------------------------------------------
                // COMMENT LIKES
                // --------------------------------------------------
                console.log("Creating comment likes...");
                _c = 0, createdComments_1 = createdComments_2;
                _e.label = 26;
            case 26:
                if (!(_c < createdComments_1.length)) return [3 /*break*/, 29];
                comment = createdComments_1[_c];
                likers = faker_1.faker.helpers.arrayElements(contentUsers_2, faker_1.faker.number.int({
                    min: 0,
                    max: Math.min(10, contentUsers_2.length),
                }));
                comment.likes =
                    likers.map(function (user) { return user._id; });
                return [4 /*yield*/, comment.save()];
            case 27:
                _e.sent();
                _e.label = 28;
            case 28:
                _c++;
                return [3 /*break*/, 26];
            case 29:
                console.log("Comment likes created.");
                // --------------------------------------------------
                // REPLIES
                // --------------------------------------------------
                console.log("Creating replies...");
                replies = Array.from({
                    length: REPLY_COUNT,
                }, function () {
                    var author = faker_1.faker.helpers.arrayElement(contentUsers_2);
                    var comment = faker_1.faker.helpers.arrayElement(createdComments_2);
                    return {
                        author: author._id,
                        comment: comment._id,
                        body: faker_1.faker.lorem.sentences({
                            min: 1,
                            max: 3,
                        }),
                        likes: [],
                    };
                });
                return [4 /*yield*/, Reply_js_1.default.insertMany(replies)];
            case 30:
                createdReplies = _e.sent();
                console.log("Created ".concat(createdReplies.length, " replies."));
                // --------------------------------------------------
                // REPLY LIKES
                // --------------------------------------------------
                console.log("Creating reply likes...");
                _d = 0, createdReplies_1 = createdReplies;
                _e.label = 31;
            case 31:
                if (!(_d < createdReplies_1.length)) return [3 /*break*/, 34];
                reply = createdReplies_1[_d];
                likers = faker_1.faker.helpers.arrayElements(contentUsers_2, faker_1.faker.number.int({
                    min: 0,
                    max: Math.min(8, contentUsers_2.length),
                }));
                reply.likes =
                    likers.map(function (user) { return user._id; });
                return [4 /*yield*/, reply.save()];
            case 32:
                _e.sent();
                _e.label = 33;
            case 33:
                _d++;
                return [3 /*break*/, 31];
            case 34:
                console.log("Reply likes created.");
                // --------------------------------------------------
                // COMPLETE
                // --------------------------------------------------
                console.log("\nSeed completed successfully!\n");
                console.log("\nSystem user: ".concat(systemUser.email, "\n\nFaker users: ").concat(createdUsers.length, "\nTotal users: ").concat(contentUsers_2.length, "\n\nBlogs:       ").concat(createdBlogs.length, "\nPublished:   ").concat(createdBlogs.filter(function (blog) {
                    return blog.status ===
                        "published";
                }).length, "\nDrafts:      ").concat(createdBlogs.filter(function (blog) {
                    return blog.status ===
                        "draft";
                }).length, "\n\nComments:    ").concat(createdComments_2.length, "\nReplies:     ").concat(createdReplies.length, "\n\nCategories:  ").concat(categories_1.length, "\n\nCloudinary seed images:\n").concat(uploadedImages_1.length, "\n"));
                process.exit(0);
                return [3 /*break*/, 36];
            case 35:
                error_1 = _e.sent();
                console.error("\nSeed failed:", error_1);
                process.exit(1);
                return [3 /*break*/, 36];
            case 36: return [2 /*return*/];
        }
    });
}); };
seed();
