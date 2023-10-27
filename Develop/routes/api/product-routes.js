const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        { model: Category }, 
        { model: Tag, through: ProductTag }, 
      ],
    });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category }, 
        { model: Tag, through: ProductTag },
      ],
    });

    if (!product) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.status(200).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST (create) a new product
router.post('/', async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    
    if (req.body.tagIds && req.body.tagIds.length) {
      // If there are associated tags, create pairings in the ProductTag model
      const productTagIdArr = req.body.tagIds.map((tag_id) => ({
        product_id: newProduct.id,
        tag_id,
      }));
      await ProductTag.bulkCreate(productTagIdArr);
    }
    
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT (update) a product by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (req.body.tagIds && req.body.tagIds.length) {
      // Handle updating associations with tags
      const existingProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });
      const existingTagIds = existingProductTags.map((productTag) => productTag.tag_id);

      const newProductTags = req.body.tagIds
        .filter((tag_id) => !existingTagIds.includes(tag_id))
        .map((tag_id) => ({
          product_id: req.params.id,
          tag_id,
        }));
        
      const removedProductTags = existingProductTags
        .filter((productTag) => !req.body.tagIds.includes(productTag.tag_id))
        .map((productTag) => productTag.id);

      await Promise.all([
        ProductTag.destroy({ where: { id: removedProductTags } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    res.status(200).json({ message: 'Product updated successfully' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a product by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deletedProduct === 0) {
      res.status(404).json({ message: 'No product found with this id' });
      return;
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
