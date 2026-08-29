import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import User from "../models/User.js";
import Blog from "../models/Blog.js";
import Comment from "../models/Comment.js";
import Reply from "../models/Reply.js";
import Category from "../models/Category.js";
import cloudinary from "../config/cloudinary.js";

const DB_URI = process.env.DB_URI;

if (!DB_URI) {
  throw new Error("DB_URI is not defined");
}

// --------------------------------------------------
// CONFIG
// --------------------------------------------------

const USER_COUNT = 30;
const BLOG_COUNT = 50;
const COMMENT_COUNT = 150;
const REPLY_COUNT = 200;

const SYSTEM_USER_EMAIL = "raphaeldonatus9@gmail.com";

// --------------------------------------------------
// PATH SETUP
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEED_IMAGES_DIR = path.join(
  __dirname,
  "../../seed-images",
);

const SEED_IMAGE_FILES = [
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

const hashPassword = async (plainPassword: string) => {
  const salt = await bcrypt.genSalt(10);

  return bcrypt.hash(plainPassword, salt);
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const generateUsername = () => {
  const username = faker.internet
    .username()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");

  return `${username}_${faker.string.numeric(4)}`;
};

const generateSlug = (
  title: string,
  usedSlugs: Set<string>,
) => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  let slug = baseSlug;
  let counter = 1;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  usedSlugs.add(slug);

  return slug;
};

// --------------------------------------------------
// CLOUDINARY SEED IMAGE UPLOAD
// --------------------------------------------------

const uploadSeedImage = async (
  filePath: string,
): Promise<string> => {
  const result =
    await cloudinary.uploader.upload(
      filePath,
      {
        folder: "hapblog/seed",
        resource_type: "image",
      },
    );

  return result.secure_url;
};

const uploadSeedImages = async (): Promise<
  string[]
> => {
  console.log(
    "Uploading seed images to Cloudinary...",
  );

  const uploadedImages: string[] = [];

  for (const filename of SEED_IMAGE_FILES) {
    const filePath = path.join(
      SEED_IMAGES_DIR,
      filename,
    );

    console.log(
      `Uploading ${filename}...`,
    );

    const imageUrl =
      await uploadSeedImage(filePath);

    uploadedImages.push(imageUrl);

    console.log(
      `Uploaded ${filename}`,
    );
  }

  console.log(
    `Uploaded ${uploadedImages.length} seed images.`,
  );

  return uploadedImages;
};

// --------------------------------------------------
// RICH TIPTAP CONTENT
// --------------------------------------------------

const generateRichContent = (
  title: string,
  categoryName: string,
) => {
  const intro1 = faker.lorem.sentences({
    min: 2,
    max: 4,
  });

  const intro2 = faker.lorem.sentences({
    min: 2,
    max: 4,
  });

  const paragraph1 =
    faker.lorem.paragraph();

  const paragraph2 =
    faker.lorem.paragraph();

  const paragraph3 =
    faker.lorem.paragraph();

  const paragraph4 =
    faker.lorem.paragraph();

  const paragraph5 =
    faker.lorem.paragraph();

  const paragraph6 =
    faker.lorem.paragraph();

  const listItems = Array.from(
    { length: 4 },
    () => faker.lorem.sentence(),
  );

  const numberedItems = Array.from(
    { length: 4 },
    () => faker.lorem.sentence(),
  );

  const quote = faker.lorem.sentence({
    min: 8,
    max: 18,
  });

  const conclusion =
    faker.lorem.sentences({
      min: 2,
      max: 4,
    });

  return `
    <h2>${escapeHtml(title)}</h2>

    <p>
      <strong>${escapeHtml(categoryName)}</strong> is an area that
      continues to influence how people think, work, learn, and
      interact with the world around them.
    </p>

    <p>
      ${escapeHtml(intro1)}
    </p>

    <p>
      ${escapeHtml(intro2)}
    </p>

    <h2>Why this matters</h2>

    <p>
      ${escapeHtml(paragraph1)}
    </p>

    <p>
      ${escapeHtml(paragraph2)}
    </p>

    <blockquote>
      <p>
        ${escapeHtml(quote)}
      </p>
    </blockquote>

    <h3>Important things to consider</h3>

    <p>
      ${escapeHtml(paragraph3)}
    </p>

    <ul>
      ${listItems
        .map(
          (item) => `
            <li>
              <p>${escapeHtml(item)}</p>
            </li>
          `,
        )
        .join("")}
    </ul>

    <h3>A practical approach</h3>

    <p>
      ${escapeHtml(paragraph4)}
    </p>

    <ol>
      ${numberedItems
        .map(
          (item) => `
            <li>
              <p>${escapeHtml(item)}</p>
            </li>
          `,
        )
        .join("")}
    </ol>

    <p>
      ${escapeHtml(paragraph5)}
    </p>

    <h2>What you should remember</h2>

    <p>
      ${escapeHtml(paragraph6)}
    </p>

    <p>
      You don't always need to make dramatic changes. Sometimes,
      <strong>small and consistent improvements</strong> can produce
      meaningful results over time.
    </p>

    <p>
      ${escapeHtml(conclusion)}
    </p>

    <hr>

    <p>
      <em>
        What do you think about this topic? Share your thoughts in
        the comments below.
      </em>
    </p>
  `.trim();
};

// --------------------------------------------------
// MAIN SEED
// --------------------------------------------------

const seed = async () => {
  try {
    // --------------------------------------------------
    // CONNECT DATABASE
    // --------------------------------------------------

    await mongoose.connect(DB_URI);

    console.log("Connected to MongoDB");

    // --------------------------------------------------
    // GET SYSTEM USER
    // --------------------------------------------------

    const systemUser =
      await User.findOne({
        email: SYSTEM_USER_EMAIL,
      });

    if (!systemUser) {
      throw new Error(
        `System user ${SYSTEM_USER_EMAIL} was not found.`,
      );
    }

    console.log(
      `System user preserved: ${systemUser.email}`,
    );

    // --------------------------------------------------
    // CLEAR OLD SEED DATA
    // --------------------------------------------------

    console.log(
      "Clearing old seed data...",
    );

    // Replies first because they reference comments
    await Reply.deleteMany({});

    // Comments reference blogs
    await Comment.deleteMany({});

    // Delete all blogs
    await Blog.deleteMany({});

    // Delete every user except system user
    await User.deleteMany({
      _id: {
        $ne: systemUser._id,
      },
    });

    console.log(
      "Old users, blogs, comments and replies cleared.",
    );

    // --------------------------------------------------
    // RESET SYSTEM USER RELATIONSHIPS
    // --------------------------------------------------

    systemUser.followers = [];
    systemUser.following = [];
    systemUser.bookmarks = [];

    await systemUser.save();

    // --------------------------------------------------
    // CATEGORIES
    // --------------------------------------------------

    const categories =
      await Category.find({});

    if (categories.length === 0) {
      throw new Error(
        "No categories found. Create your categories before running the seed.",
      );
    }

    console.log(
      `Found ${categories.length} categories.`,
    );

    // --------------------------------------------------
    // UPLOAD SEED IMAGES
    // --------------------------------------------------

    const uploadedImages =
      await uploadSeedImages();

    if (uploadedImages.length === 0) {
      throw new Error(
        "No seed images were uploaded.",
      );
    }

    // --------------------------------------------------
    // USERS
    // --------------------------------------------------

    console.log(
      "Creating Faker users...",
    );

    const password =
      await hashPassword(
        "Password123!",
      );

    const users = Array.from(
      { length: USER_COUNT },
      () => ({
        name:
          faker.person.fullName(),

        username:
          generateUsername(),

        email:
          faker.internet
            .email()
            .toLowerCase(),

        password,

        role: "user" as const,

        avatar:
          faker.image.avatar(),

        bio:
          faker.person.bio(),

        followers:
          [] as mongoose.Types.ObjectId[],

        following:
          [] as mongoose.Types.ObjectId[],

        bookmarks:
          [] as mongoose.Types.ObjectId[],
      }),
    );

    const createdUsers =
      await User.insertMany(users);

    console.log(
      `Created ${createdUsers.length} Faker users.`,
    );

    // --------------------------------------------------
    // ALL USERS THAT CAN CREATE CONTENT
    // --------------------------------------------------

    const contentUsers = [
      systemUser,
      ...createdUsers,
    ];

    // --------------------------------------------------
    // FOLLOWERS / FOLLOWING
    // --------------------------------------------------

    console.log(
      "Creating follower/following relationships...",
    );

    for (const user of createdUsers) {
      const possibleUsers =
        contentUsers.filter(
          (other) =>
            !other._id.equals(
              user._id,
            ),
        );

      const followingUsers =
        faker.helpers.arrayElements(
          possibleUsers,
          faker.number.int({
            min: 0,
            max: Math.min(
              10,
              possibleUsers.length,
            ),
          }),
        );

      user.following =
        followingUsers.map(
          (other) => other._id,
        );

      await user.save();

      for (const followedUser of followingUsers) {
        await User.findByIdAndUpdate(
          followedUser._id,
          {
            $addToSet: {
              followers: user._id,
            },
          },
        );
      }
    }

    console.log(
      "Follower/following relationships created.",
    );

    // --------------------------------------------------
    // BLOGS
    // --------------------------------------------------

    console.log(
      "Creating rich blog posts...",
    );

    const usedSlugs =
      new Set<string>();

    const blogs = Array.from(
      { length: BLOG_COUNT },
      () => {
        const author =
          faker.helpers.arrayElement(
            contentUsers,
          );

        const category =
          faker.helpers.arrayElement(
            categories,
          );

        const title =
          faker.lorem.sentence({
            min: 5,
            max: 12,
          });

        const slug =
          generateSlug(
            title,
            usedSlugs,
          );

        const status =
          faker.helpers.arrayElement([
            "published",
            "published",
            "published",
            "draft",
          ] as const);

        return {
          title,

          slug,

          content:
            generateRichContent(
              title,
              category.name,
            ),

          // Cloudinary image
          imageUrl:
            faker.helpers.arrayElement(
              uploadedImages,
            ),

          author:
            author._id,

          category:
            category._id,

          status,

          likes:
            [] as mongoose.Types.ObjectId[],
        };
      },
    );

    const createdBlogs =
      await Blog.insertMany(
        blogs,
      );

    console.log(
      `Created ${createdBlogs.length} rich blogs.`,
    );

    // --------------------------------------------------
    // BLOG LIKES
    // --------------------------------------------------

    console.log(
      "Creating blog likes...",
    );

    for (const blog of createdBlogs) {
      const likers =
        faker.helpers.arrayElements(
          contentUsers,
          faker.number.int({
            min: 0,
            max: Math.min(
              15,
              contentUsers.length,
            ),
          }),
        );

      blog.likes =
        likers.map(
          (user) => user._id,
        );

      await blog.save();
    }

    console.log(
      "Blog likes created.",
    );

    // --------------------------------------------------
    // BOOKMARKS
    // --------------------------------------------------

    console.log(
      "Creating bookmarks...",
    );

    for (const user of contentUsers) {
      const publishedBlogs =
        createdBlogs.filter(
          (blog) =>
            blog.status ===
            "published",
        );

      const bookmarks =
        faker.helpers.arrayElements(
          publishedBlogs,
          faker.number.int({
            min: 0,
            max: Math.min(
              10,
              publishedBlogs.length,
            ),
          }),
        );

      user.bookmarks =
        bookmarks.map(
          (blog) => blog._id,
        );

      await user.save();
    }

    console.log(
      "Bookmarks created.",
    );

    // --------------------------------------------------
    // COMMENTS
    // --------------------------------------------------

    console.log(
      "Creating comments...",
    );

    const publishedBlogs =
      createdBlogs.filter(
        (blog) =>
          blog.status ===
          "published",
      );

    const comments =
      Array.from(
        {
          length:
            COMMENT_COUNT,
        },
        () => {
          const author =
            faker.helpers.arrayElement(
              contentUsers,
            );

          const blog =
            faker.helpers.arrayElement(
              publishedBlogs,
            );

          return {
            author:
              author._id,

            blog:
              blog._id,

            body:
              faker.lorem.sentences({
                min: 1,
                max: 4,
              }),

            likes:
              [] as mongoose.Types.ObjectId[],
          };
        },
      );

    const createdComments =
      await Comment.insertMany(
        comments,
      );

    console.log(
      `Created ${createdComments.length} comments.`,
    );

    // --------------------------------------------------
    // COMMENT LIKES
    // --------------------------------------------------

    console.log(
      "Creating comment likes...",
    );

    for (const comment of createdComments) {
      const likers =
        faker.helpers.arrayElements(
          contentUsers,
          faker.number.int({
            min: 0,
            max: Math.min(
              10,
              contentUsers.length,
            ),
          }),
        );

      comment.likes =
        likers.map(
          (user) => user._id,
        );

      await comment.save();
    }

    console.log(
      "Comment likes created.",
    );

    // --------------------------------------------------
    // REPLIES
    // --------------------------------------------------

    console.log(
      "Creating replies...",
    );

    const replies =
      Array.from(
        {
          length:
            REPLY_COUNT,
        },
        () => {
          const author =
            faker.helpers.arrayElement(
              contentUsers,
            );

          const comment =
            faker.helpers.arrayElement(
              createdComments,
            );

          return {
            author:
              author._id,

            comment:
              comment._id,

            body:
              faker.lorem.sentences({
                min: 1,
                max: 3,
              }),

            likes:
              [] as mongoose.Types.ObjectId[],
          };
        },
      );

    const createdReplies =
      await Reply.insertMany(
        replies,
      );

    console.log(
      `Created ${createdReplies.length} replies.`,
    );

    // --------------------------------------------------
    // REPLY LIKES
    // --------------------------------------------------

    console.log(
      "Creating reply likes...",
    );

    for (const reply of createdReplies) {
      const likers =
        faker.helpers.arrayElements(
          contentUsers,
          faker.number.int({
            min: 0,
            max: Math.min(
              8,
              contentUsers.length,
            ),
          }),
        );

      reply.likes =
        likers.map(
          (user) => user._id,
        );

      await reply.save();
    }

    console.log(
      "Reply likes created.",
    );

    // --------------------------------------------------
    // COMPLETE
    // --------------------------------------------------

    console.log(
      "\nSeed completed successfully!\n",
    );

    console.log(`
System user: ${systemUser.email}

Faker users: ${createdUsers.length}
Total users: ${contentUsers.length}

Blogs:       ${createdBlogs.length}
Published:   ${
      createdBlogs.filter(
        (blog) =>
          blog.status ===
          "published",
      ).length
    }
Drafts:      ${
      createdBlogs.filter(
        (blog) =>
          blog.status ===
          "draft",
      ).length
    }

Comments:    ${createdComments.length}
Replies:     ${createdReplies.length}

Categories:  ${categories.length}

Cloudinary seed images:
${uploadedImages.length}
`);

    process.exit(0);
  } catch (error) {
    console.error(
      "\nSeed failed:",
      error,
    );

    process.exit(1);
  }
};

seed();