import FoodModel from "../models/FoodModel.js";
import fs from "fs";
import path from "path";

// add food item
const addFood = async (req, res) => {
    try {
        let image_filename = req.file ? `/uploads/${req.file.filename}` : "";

        const food = new FoodModel({
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            category: req.body.category,
            image: image_filename
        });

        await food.save();
        res.json({ success: true, message: "Food item added successfully!" });
    } catch (error) {
        console.error("Error adding food:", error);
        res.json({ success: false, message: "Error adding food item" });
    }
};

// all food list
const listFood = async (req, res) => {
    try {
        let foods = await FoodModel.find({});

        // If database is empty or has very few items, auto-seed popular food items
        if (foods.length < 5) {
            await seedInitialFoods();
            foods = await FoodModel.find({});
        }

        res.json({ success: true, data: foods });
    } catch (error) {
        console.error("Error listing food:", error);
        res.json({ success: false, message: "Error fetching food items" });
    }
};

// remove food item
const removeFood = async (req, res) => {
    try {
        const { id } = req.body;
        const food = await FoodModel.findById(id);

        if (!food) {
            return res.json({ success: false, message: "Food item not found" });
        }

        // Delete image file safely if it exists
        if (food.image) {
            const filename = food.image.replace(/^\/?uploads\//, "");
            const filePath = path.join("uploads", filename);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) {
                    console.warn("Could not delete image file:", e.message);
                }
            }
        }

        await FoodModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Food item removed successfully" });
    } catch (error) {
        console.error("Error removing food:", error);
        res.json({ success: false, message: "Error removing food item" });
    }
};

// Seed initial food items if catalog is empty
const seedInitialFoods = async () => {
    try {
        const sampleFoods = [
            {
                name: "Greek Salad",
                description: "Fresh Mediterranean salad with cucumbers, ripe tomatoes, olives, and feta cheese drizzled in olive oil.",
                price: 180,
                category: "Salad",
                image: "/uploads/1741371310609food_7.png"
            },
            {
                name: "Veg Lasagna Roll",
                description: "Delicious baked rolls packed with mixed vegetables, herbs, mozzarella, and savory marinara sauce.",
                price: 220,
                category: "Rolls",
                image: "/uploads/1741372900913food_5.png"
            },
            {
                name: "Crispy Spring Rolls",
                description: "Golden crispy fried rolls stuffed with seasoned julienned veggies served with sweet chilli dip.",
                price: 160,
                category: "Rolls",
                image: "/uploads/1757517647280-spring roll.jpeg"
            },
            {
                name: "Chocolate Lava Cake",
                description: "Warm molten chocolate cake with a gooey chocolate center, dusted with powdered sugar.",
                price: 190,
                category: "Deserts",
                image: "/uploads/1741368072297food_18.png"
            },
            {
                name: "Red Velvet Pastry",
                description: "Rich and moist red velvet sponge layered with silky cream cheese frosting.",
                price: 150,
                category: "Cake",
                image: "/uploads/1741419574245food_17.png"
            },
            {
                name: "Grilled Club Sandwich",
                description: "Triple-decker toasted sandwich packed with fresh lettuce, cheddar cheese, tomatoes, and herb mayo.",
                price: 140,
                category: "Sandwich",
                image: "/uploads/1741467958662-food_13.png"
            },
            {
                name: "Creamy Tomato Pasta",
                description: "Penne tossed in a velvety pink tomato cream sauce, seasoned with basil and parmesan.",
                price: 240,
                category: "Pasta",
                image: "/uploads/1741468098724-food_19.png"
            },
            {
                name: "Hakka Noodles",
                description: "Wok-tossed noodles with bell peppers, cabbage, spring onions, and oriental seasonings.",
                price: 170,
                category: "Noodles",
                image: "/uploads/1741468407672-food_25.png"
            },
            {
                name: "Paneer Butter Masala Bowl",
                description: "Tender cottage cheese cubes simmered in a creamy, buttery tomato gravy served with steamed rice.",
                price: 260,
                category: "Pure Veg",
                image: "/uploads/1741468820900-food_20.png"
            },
            {
                name: "Strawberry Cheesecake",
                description: "Classic New York style baked cheesecake topped with glazed strawberries.",
                price: 210,
                category: "Deserts",
                image: "/uploads/1741468580187-food_9.png"
            },
            {
                name: "Garlic Butter Spaghetti",
                description: "Al dente spaghetti tossed in golden garlic, extra virgin olive oil, chilli flakes, and fresh parsley.",
                price: 230,
                category: "Pasta",
                image: "/uploads/1742805760290-food_8.png"
            },
            {
                name: "Schezwan Spicy Noodles",
                description: "Fiery stir-fried noodles tossed with hot Schezwan sauce, crunchy carrots, and fresh scallions.",
                price: 180,
                category: "Noodles",
                image: "/uploads/1742806168063-food_21.png"
            }
        ];

        for (const item of sampleFoods) {
            const exists = await FoodModel.findOne({ name: item.name });
            if (!exists) {
                await FoodModel.create(item);
            }
        }
        console.log("Initial foods catalog populated successfully!");
    } catch (err) {
        console.warn("Seeding warning:", err.message);
    }
};

export { addFood, listFood, removeFood };