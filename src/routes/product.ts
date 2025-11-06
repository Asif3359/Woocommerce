import { Router } from 'express';
import Product from '../db/product.js';

const router = Router();



router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/category', async (req, res) => {
  try {

    const category = [
      { id: "1", name: "Vegetable", icon: "leaf", color: "#55a825ff" },
      { id: "2", name: "Fruits", icon: "nutrition", color: "#ff963fff" },
      { id: "3", name: "Beverages", icon: "beer", color: "#4A90E2" },
      { id: "4", name: "Grocery", icon: "basket", color: "#50C878" },
      { id: "5", name: "Edible oil", icon: "water", color: "#FFA500" },
      { id: "6", name: "Household", icon: "home", color: "#FF69B4" },
      { id: "7", name: "Babycare", icon: "happy", color: "#9370DB" }
    ];

    return res.status(200).json(category)

  } catch (error) {

  }
})


// Get products by category name
router.get('/category/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // Validate if the category name is valid
    const validCategories = ['Vegetable', 'Fruits', 'Beverages', 'Grocery', 'Edible oil', 'Household', 'Babycare'];

    if (!validCategories.includes(name)) {
      return res.status(400).json({
        message: 'Invalid category name',
        validCategories: validCategories
      });
    }

    // Find products by category
    const products = await Product.find({
      category: name,
      isActive: true
    });

    return res.status(200).json({
      category: name,
      products: products,
      count: products.length
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    return res.status(500).json({ message: 'Failed to fetch products by category' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ message: 'Failed to fetch product' });
  }
});




export default router;
