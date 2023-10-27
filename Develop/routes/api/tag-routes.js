const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// GET all tags
router.get('/', async (req, res) => {
  try {
    const allTags = await Tag.findAll({
      include: Product, // Include associated Product data
    });
    res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET one tag by ID
router.get('/:id', async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id, {
      include: Product, // Include associated Product data
    });

    if (!tag) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }

    res.status(200).json(tag);
  } catch (err) {
    res.status(500).json(err);
  }
});

// POST (create) a new tag
router.post('/', async (req, res) => {
  try {
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    res.status(400).json(err);
  }
});

// PUT (update) a tag by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedTag = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (err) {
    res.status(400).json(err);
  }
});

// DELETE a tag by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (deletedTag === 0) {
      res.status(404).json({ message: 'No tag found with this id' });
      return;
    }

    res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
