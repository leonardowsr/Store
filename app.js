const categoryList = document.querySelector('#category')
const searchInput = document.querySelector('#searchInput')
const filterButton = document.querySelector('#buttonFilter')
const jsonArchive = "products.json"
const section = document.querySelector('section')
let productContainers;
searchProducts(categoryList.value, section)
let priceTotal = 0
const totalPriceElement = document.querySelector('.totalPrice')
const listProductsCart = document.querySelector('.listProductsCart')

async function fetchUrl(json) {
  try {
    const response = await fetch(json)
    if (!response.ok) {
      throw new Error('motivo')
    }
    const responseJson = await response.json()

    return responseJson
  } catch (error) {
    console.log('Não foi possivel fazer a requisição: ', error)
  }
}
filterButton.addEventListener('click', e => {
  searchProducts(searchInput.value, section)
})


categoryList.addEventListener('change', e => {
  searchProducts(categoryList.value, section)
})

async function searchProducts(word, containerElement) {
  const productsList = await fetchUrl(jsonArchive)
  removeProdutcs('.productContainer')
  renderProducts(word, productsList, containerElement)
}

function removeProdutcs(elementClass) {
  const allElements = document.querySelectorAll(elementClass)
  for (const element of allElements) {
    element.remove()
  }
}

function renderProducts(keyWord, array, containerElement) {
  const fragment = document.createDocumentFragment()
  const listProducts = filter(keyWord, array)
  for (const { name, price, image } of listProducts) {
    const product = createProduct(name, image, price)
    fragment.appendChild(product)
  }
  productContainers = document.querySelectorAll('.productContainer');
  containerElement.appendChild(fragment)
  searchInput.value = ''
}

function createProduct(productName, photoProduct, productPrice) {
  const div = createElementProduct('div', { class: 'productContainer' })
  const h2 = createElementProduct('h2', { class: 'productName', id: productName }, productName)
  const p = createElementProduct('p', { class: 'plus', name: `${productPrice}` }, '+')
  const p2 = createElementProduct('p', { class: 'less' }, '-')
  const span = createElementProduct('span', { class: 'price' }, `R$ ${productPrice}`)
  const img = document.createElement('img')
  img.setAttribute('src', `img-resized/${photoProduct}`)
  img.setAttribute('alt', `photo of ${photoProduct}`)
  div.appendChild(h2)
  div.appendChild(img)
  div.appendChild(p)
  div.appendChild(p2)
  div.appendChild(span)
  return div
}

function filter(keyWord, array) {
  const selectedCategory = categoryList.value
  const searchInputValue = normalize(searchInput.value)
  let keyWordNormalized
  if (keyWord.length > 0) {
    keyWordNormalized = normalize(keyWord)
  }
  const productsNormalized = array.map(({ name, price, type, image }) => {
    return { name: name, price: price, image: image, type: normalize(type) }
  })
  if ((searchInputValue === '' && selectedCategory == 'todos')) {
    return array
  }
  return productsNormalized.filter(({ name, type }) => {
    if (selectedCategory == 'todos') {
      return normalize(name).includes(searchInputValue)
    }
    if (searchInputValue.length > 0) {
      return type.includes(selectedCategory) && normalize(name).includes(searchInputValue)
    }
    return type.includes(selectedCategory)
  })
}
function normalize(str) {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f-]/g, "");
}

section.addEventListener('click', (e) => {
  const productContainer = e.target.closest('.productContainer');

  if (productContainer) {
    const productName = productContainer.querySelector('h2').textContent;
    const priceProduct = Number(productContainer.querySelector('.price').textContent.replace('R$ ', ''));

    handleProductQuantity(productName, priceProduct, e.target.textContent);

    totalPriceElement.textContent = priceTotal.toFixed(2);
  }
});

function handleProductQuantity(productName, priceProduct, operator) {
  const existingProduct = listProductsCart.querySelector(`li[data-product-name="${productName}"]`);

  if (existingProduct) {
    const quantitySpan = existingProduct.querySelector('.quantity');
    let quantity = Number(quantitySpan.textContent.replace(' un.', ''));
    if (operator === '+' && quantity >= 0) {
      quantity++;
      priceTotal += priceProduct;
    } else if (operator === '-' && quantity > 1) {
      quantity--;
      priceTotal -= priceProduct;
    } else if (operator === '-' && quantity === 1) {
      existingProduct.remove();
      priceTotal -= priceProduct;
    }

    quantitySpan.textContent = quantity + ' un.';
  } else if (operator === '+') {
    createProductListItem(productName, priceProduct);
    priceTotal += priceProduct;
  }
}

function createProductListItem(productName, priceProduct) {
  if (!typeof productName === "String" && !typeof priceProduct === 'number') {
    throw new Error('productName dont is string e priceProduct dont is number')
  }

  const li = createElementProduct('li', { "data-product-Name": productName })
  const div = document.createElement('div')
  const div2 = document.createElement('div')
  const span = createElementProduct('span', {'data-price':priceProduct, 'class':'quantity'},1 + ' un.')
  span.classList.add('price');
  const span2 = createElementProduct('span', {},' - R$ ' + priceProduct)
  const p = createElementProduct('p', {},productName)
  const buttonRemove = createElementProduct('button', {},"X" );
  const buttonLess = createElementProduct('button', {}, '-' )
  const buttonPlus = createElementProduct('button', {}, '+' )


  buttonRemove.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    const productPrice = Number(li.querySelector('.price').dataset.price);

    let quantityProduct = Number(li.querySelector('.quantity').textContent.replace(' un.', ''))
    priceTotal -= productPrice * quantityProduct;

    totalPriceElement.textContent = priceTotal.toFixed(2);
    li.remove();
  });
  buttonLess.addEventListener('click', e => {
    const productLi = e.target.closest('li');
    updateProductQuantity(productLi, true);
  });

  buttonPlus.addEventListener('click', e => {
    const productLi = e.target.closest('li');
    updateProductQuantity(productLi, false);
  });

  div2.appendChild(span);
  div2.appendChild(p);
  div.appendChild(buttonPlus)
  div.appendChild(buttonLess)
  div.appendChild(buttonRemove);
  li.appendChild(div2)
  li.appendChild(div)
  listProductsCart.appendChild(li);
}
function updateProductQuantity(productLi, isDecrement) {
  const quantitySpan = productLi.querySelector('.quantity');
  let currentQuantity = Number(quantitySpan.textContent.replace(' un.', ''));
  const productPrice = Number(quantitySpan.dataset.price);

  if (isDecrement && currentQuantity > 1) {
    currentQuantity--;
    priceTotal -= productPrice;
  } else if (!isDecrement && currentQuantity >= 0) {
    currentQuantity++;
    priceTotal += productPrice;
  }

  quantitySpan.textContent = `${currentQuantity} un.`;
  totalPriceElement.textContent = priceTotal.toFixed(2);

  if (priceTotal <= 0) {
    priceTotal = 0;
  }
}

function createElementProduct(tagName, config, textContent) {
  const element = document.createElement(tagName)
  element.textContent = textContent
  for (const attribute in config) {
    element.setAttribute(attribute, config[attribute])
  }
  return element
}