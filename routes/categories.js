var express = require('express');
var router = express.Router();
let { RandomToken } = require('../utils/GenToken')
// Clear cache to reload data
delete require.cache[require.resolve('../utils/data')];
let { data } = require('../utils/data')
let { categories } = require('../utils/data')
let slugify = require('slugify')
let { IncrementalId } = require('../utils/IncrementalIdHandler')

/* GET all categories with optional name query */
///api/v1/categories
router.get('/', function (req, res, next) {
  let nameQ = req.query.name ? req.query.name : '';
  let result = categories.filter(function (e) {
    return (!e.isDeleted) && e.name.toLowerCase().includes(nameQ.toLowerCase())
  })
  res.send(result);
});

/* GET category by slug */
///api/v1/categories/slug/:slug
router.get('/slug/:slug', function (req, res, next) {
  let slug = req.params.slug;
  let result = categories.find(
    function (e) {
      return (!e.isDeleted) && e.slug == slug;
    }
  )
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "SLUG NOT FOUND"
    })
  }
});

/* GET all products by category id */
///api/v1/categories/:id/products
router.get('/:id/products', function (req, res, next) {
  let categoryId = parseInt(req.params.id);
  console.log('Searching for categoryId:', categoryId);
  console.log('Total products:', data.length);
  let result = data.filter(
    function (e) {
      if (e.category) {
        console.log('Product category id:', e.category.id, 'type:', typeof e.category.id);
      }
      return e.category && e.category.id === categoryId
    }
  );
  console.log('Found products:', result.length);
  if (result.length > 0) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "NO PRODUCTS FOUND FOR THIS CATEGORY"
    })
  }
});

/* GET category by ID */
///api/v1/categories/:id
router.get('/:id', function (req, res, next) {
  let result = categories.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    res.status(200).send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
});

/* POST create new category */
router.post('/', function (req, res, next) {
  let newObj = {
    id: IncrementalId(categories),
    name: req.body.name,
    slug: slugify(req.body.name, {
      replacement: '-', lower: true, locale: 'vi',
    }),
    image: req.body.image,
    creationAt: new Date(Date.now()),
    updatedAt: new Date(Date.now()),
    isDeleted: false
  }
  categories.push(newObj);
  res.status(201).send(newObj);
})

/* PUT edit category */
router.put('/:id', function (req, res, next) {
  let result = categories.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    let body = req.body;
    let keys = Object.keys(body);
    for (const key of keys) {
      if (key === 'name') {
        result[key] = body[key];
        result.slug = slugify(body[key], {
          replacement: '-', lower: true, locale: 'vi',
        });
      } else if (result[key] !== undefined) {
        result[key] = body[key];
      }
    }
    result.updatedAt = new Date(Date.now());
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

/* DELETE category (soft delete) */
router.delete('/:id', function (req, res, next) {
  let result = categories.find(
    function (e) {
      return (!e.isDeleted) && e.id == req.params.id
    }
  );
  if (result) {
    result.isDeleted = true;
    result.updatedAt = new Date(Date.now());
    res.send(result)
  } else {
    res.status(404).send({
      message: "ID NOT FOUND"
    })
  }
})

module.exports = router;
