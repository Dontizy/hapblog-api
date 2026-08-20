import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import "dotenv/config";


const DB_URI = process.env.DB_URI;
const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};
if (!DB_URI) {
  throw new Error("DB_URI is not defined");
}

const USER_COUNT = 30;
const BLOG_COUNT = 50;
const COMMENT_COUNT = 150;
const REPLY_COUNT = 200;

const seed = async () => {
  try {
    await mongoose.connect(DB_URI);

    console.log("Connected to MongoDB");

    // Clear existing seed data
    await Reply.deleteMany({});
    await Comment.deleteMany({});
    await Blog.deleteMany({});
    await User.deleteMany({});

    console.log("Existing data cleared");

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    const password = await hashPassword("Password123!");

    console.log("Created follower/following relationships");

    // --------------------------------------------------
    // BLOGS
    // --------------------------------------------------
    const generateUsername = () => {
      const username = faker.internet
        .username()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "");

      return `${username}_${faker.string.numeric(4)}`;
    };

    const users = Array.from({ length: USER_COUNT }, () => ({
      name: faker.person.fullName(),

      username: generateUsername(),

      email: faker.internet.email().toLowerCase(),

      password,

      role: "user" as const,

      avatar: faker.image.avatar(),

      bio: faker.person.bio(),

      followers: [] as mongoose.Types.ObjectId[],
      following: [] as mongoose.Types.ObjectId[],
      bookmarks: [] as mongoose.Types.ObjectId[],
    }));

    const createdUsers = await User.insertMany(users);

    console.log(`Created ${createdUsers.length} users`);

    // --------------------------------------------------
    // FOLLOWERS / FOLLOWING
    // --------------------------------------------------

    for (const user of createdUsers) {
      const possibleUsers = createdUsers.filter(
        (other) => !other._id.equals(user._id),
      );

      const followingUsers = faker.helpers.arrayElements(
        possibleUsers,
        faker.number.int({
          min: 0,
          max: Math.min(10, possibleUsers.length),
        }),
      );

      user.following = followingUsers.map((other) => other._id);

      await user.save();

      for (const followedUser of followingUsers) {
        await User.findByIdAndUpdate(followedUser._id, {
          $addToSet: {
            followers: user._id,
          },
        });
      }
    }

    console.log("Created follower/following relationships");

    const blogs = Array.from({ length: BLOG_COUNT }, () => {
      const author = faker.helpers.arrayElement(createdUsers);

      return {
        title: faker.lorem.sentence({
          min: 5,
          max: 12,
        }),

        content: faker.lorem.paragraphs({
          min: 5,
          max: 12,
        }),

        // category: faker.helpers.arrayElement(BLOG_CATEGORIES),

        author: author._id,

        status: faker.helpers.arrayElement(["draft", "published"] as const),

        likes: [] as mongoose.Types.ObjectId[],
      };
    });

    const createdBlogs = await Blog.insertMany(blogs);

    console.log(`Created ${createdBlogs.length} blogs`);

    // --------------------------------------------------
    // BLOG LIKES
    // --------------------------------------------------

    for (const blog of createdBlogs) {
      const likers = faker.helpers.arrayElements(
        createdUsers,
        faker.number.int({
          min: 0,
          max: Math.min(15, createdUsers.length),
        }),
      );

      blog.likes = likers.map((user) => user._id);

      await blog.save();
    }

    console.log("Created blog likes");

    // --------------------------------------------------
    // BOOKMARKS
    // --------------------------------------------------

    for (const user of createdUsers) {
      const bookmarks = faker.helpers.arrayElements(
        createdBlogs,
        faker.number.int({
          min: 0,
          max: Math.min(10, createdBlogs.length),
        }),
      );

      user.bookmarks = bookmarks.map((blog) => blog._id);

      await user.save();
    }

    console.log("Created bookmarks");

    // --------------------------------------------------
    // COMMENTS
    // --------------------------------------------------

    const comments = Array.from({ length: COMMENT_COUNT }, () => {
      const author = faker.helpers.arrayElement(createdUsers);

      const blog = faker.helpers.arrayElement(
        createdBlogs.filter((blog) => blog.status === "published"),
      );

      return {
        author: author._id,

        blog: blog._id,

        body: faker.lorem.sentences({
          min: 1,
          max: 4,
        }),

        likes: [] as mongoose.Types.ObjectId[],
      };
    });

    const createdComments = await Comment.insertMany(comments);

    console.log(`Created ${createdComments.length} comments`);

    // --------------------------------------------------
    // COMMENT LIKES
    // --------------------------------------------------

    for (const comment of createdComments) {
      const likers = faker.helpers.arrayElements(
        createdUsers,
        faker.number.int({
          min: 0,
          max: Math.min(10, createdUsers.length),
        }),
      );

      comment.likes = likers.map((user) => user._id);

      await comment.save();
    }

    console.log("Created comment likes");

    // --------------------------------------------------
    // REPLIES
    // --------------------------------------------------

    const replies = Array.from({ length: REPLY_COUNT }, () => {
      const author = faker.helpers.arrayElement(createdUsers);

      const comment = faker.helpers.arrayElement(createdComments);

      return {
        author: author._id,

        comment: comment._id,

        body: faker.lorem.sentences({
          min: 1,
          max: 3,
        }),

        likes: [] as mongoose.Types.ObjectId[],
      };
    });

    const createdReplies = await Reply.insertMany(replies);

    console.log(`Created ${createdReplies.length} replies`);

    // --------------------------------------------------
    // REPLY LIKES
    // --------------------------------------------------

    for (const reply of createdReplies) {
      const likers = faker.helpers.arrayElements(
        createdUsers,
        faker.number.int({
          min: 0,
          max: Math.min(8, createdUsers.length),
        }),
      );

      reply.likes = likers.map((user) => user._id);

      await reply.save();
    }

    console.log("Created reply likes");

    console.log("\nSeed completed successfully!");

    console.log(`
Users:    ${createdUsers.length}
Blogs:    ${createdBlogs.length}
Comments: ${createdComments.length}
Replies:  ${createdReplies.length}
`);

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seed();
