import dns from "dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const products = [
  {
    name: "Apple MacBook Pro 14 Inch Space Grey",
    description:
      "The MacBook Pro 14 Inch in Space Grey is a powerful and sleek laptop, featuring Apple's M1 Pro chip for exceptional performance and a stunning Retina display.",
    price: 169999,
    category: "Electronics",
    image: "https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/thumbnail.webp",
    stock: 24,
  },
  {
    name: "Asus Zenbook Pro Dual Screen Laptop",
    description:
      "The Asus Zenbook Pro Dual Screen Laptop is a high-performance device with dual screens, providing productivity and versatility for creative professionals.",
    price: 152999,
    category: "Electronics",
    image: "https://cdn.dummyjson.com/product-images/laptops/asus-zenbook-pro-dual-screen-laptop/thumbnail.webp",
    stock: 45,
  },
  {
    name: "Huawei Matebook X Pro",
    description:
      "The Huawei Matebook X Pro is a slim and stylish laptop with a high-resolution touchscreen display, offering a premium experience for users on the go.",
    price: 118999,
    category: "Electronics",
    image: "https://cdn.dummyjson.com/product-images/laptops/huawei-matebook-x-pro/thumbnail.webp",
    stock: 75,
  },
  {
    name: "Lenovo Yoga 920",
    description:
      "The Lenovo Yoga 920 is a 2-in-1 convertible laptop with a flexible hinge, allowing you to use it as a laptop or tablet, offering versatility and portability.",
    price: 93499,
    category: "Electronics",
    image: "https://cdn.dummyjson.com/product-images/laptops/lenovo-yoga-920/thumbnail.webp",
    stock: 40,
  },
  {
    name: "Blue & Black Check Shirt",
    description:
      "The Blue & Black Check Shirt is a stylish and comfortable men's shirt featuring a classic check pattern. Made from high-quality fabric, it's suitable for both casual and semi-formal occasions.",
    price: 2549,
    category: "Fashion",
    image: "https://cdn.dummyjson.com/product-images/mens-shirts/blue-&-black-check-shirt/thumbnail.webp",
    stock: 38,
  },
  {
    name: "Gigabyte Aorus Men Tshirt",
    description:
      "The Gigabyte Aorus Men Tshirt is a cool and casual shirt for gaming enthusiasts. With the Aorus logo and sleek design, it's perfect for expressing your gaming style.",
    price: 2124,
    category: "Fashion",
    image: "https://cdn.dummyjson.com/product-images/mens-shirts/gigabyte-aorus-men-tshirt/thumbnail.webp",
    stock: 90,
  },
  {
    name: "Man Plaid Shirt",
    description:
      "The Man Plaid Shirt is a timeless and versatile men's shirt with a classic plaid pattern. Its comfortable fit and casual style make it a wardrobe essential for various occasions.",
    price: 2974,
    category: "Fashion",
    image: "https://cdn.dummyjson.com/product-images/mens-shirts/man-plaid-shirt/thumbnail.webp",
    stock: 82,
  },
  {
    name: "Man Short Sleeve Shirt",
    description:
      "The Man Short Sleeve Shirt is a breezy and stylish option for warm days. With a comfortable fit and short sleeves, it's perfect for a laid-back yet polished look.",
    price: 1699,
    category: "Fashion",
    image: "https://cdn.dummyjson.com/product-images/mens-shirts/man-short-sleeve-shirt/thumbnail.webp",
    stock: 2,
  },
  {
    name: "Annibale Colombo Bed",
    description:
      "The Annibale Colombo Bed is a luxurious and elegant bed frame, crafted with high-quality materials for a comfortable and stylish bedroom.",
    price: 161499,
    category: "Home",
    image: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-bed/thumbnail.webp",
    stock: 88,
  },
  {
    name: "Annibale Colombo Sofa",
    description:
      "The Annibale Colombo Sofa is a sophisticated and comfortable seating option, featuring exquisite design and premium upholstery for your living room.",
    price: 212499,
    category: "Home",
    image: "https://cdn.dummyjson.com/product-images/furniture/annibale-colombo-sofa/thumbnail.webp",
    stock: 60,
  },
  {
    name: "Bedside Table African Cherry",
    description:
      "The Bedside Table in African Cherry is a stylish and functional addition to your bedroom, providing convenient storage space and a touch of elegance.",
    price: 25499,
    category: "Home",
    image: "https://cdn.dummyjson.com/product-images/furniture/bedside-table-african-cherry/thumbnail.webp",
    stock: 64,
  },
  {
    name: "Knoll Saarinen Executive Conference Chair",
    description:
      "The Knoll Saarinen Executive Conference Chair is a modern and ergonomic chair, perfect for your office or conference room with its timeless design.",
    price: 42499,
    category: "Home",
    image: "https://cdn.dummyjson.com/product-images/furniture/knoll-saarinen-executive-conference-chair/thumbnail.webp",
    stock: 26,
  },
  {
    name: "Atomic Habits",
    description:
      "A practical guide to building good habits and breaking bad ones, by James Clear.",
    price: 499,
    category: "Books",
    image: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
    stock: 50,
  },
  {
    name: "Clean Code",
    description:
      "A handbook of agile software craftsmanship covering readable and maintainable code, by Robert C. Martin.",
    price: 1899,
    category: "Books",
    image: "https://covers.openlibrary.org/b/isbn/9780132350884-L.jpg",
    stock: 7,
  },
  {
    name: "Sapiens: A Brief History of Humankind",
    description:
      "A sweeping account of how Homo sapiens came to dominate the planet, by Yuval Noah Harari.",
    price: 599,
    category: "Books",
    image: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
    stock: 0,
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.dbURL);
    console.log("MongoDB connected");

    const deleted = await Product.deleteMany({});
    console.log(`Removed ${deleted.deletedCount} existing products`);

    const inserted = await Product.insertMany(products);
    console.log(`Inserted ${inserted.length} products`);
  } catch (error) {
    console.log("Seeding failed:", error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
