const db = {
  methods: {
    find: (id) => {
      return db.items.find((item) => item.id === id);
    },
    remove: (items) => {
      items.forEach((element) => {
        const product = db.methods.find(element.id);
        product.qty = product.qty - element.qty;
      });
      console.log(db);
    },
  },
  items: [
    { id: 0, title: "Funko", precio: 250, qty: 5 },
    { id: 1, title: "Spider", precio: 1250, qty: 10 },
    { id: 3, title: "Mouses", precio: 25450, qty: 51 },
  ],
};

const shoppingCart = {
  items: [],
  methods: {
    add: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem) {
        if (shoppingCart.methods.hasInventory(id, qty + cartItem.qty)) {
          cartItem.qty += qty;
        } else {
          alert("No hay inventario");
        }
      } else {
        shoppingCart.items.push({ id, qty });
      }
    },
    remove: (id, qty) => {
      const cartItem = shoppingCart.methods.get(id);
      if (cartItem.qty - qty > 0) {
        cartItem.qty -= qty;
      } else {
        shoppingCart.items = shoppingCart.items.filter(
          (item) => item.id !== id
        );
      }
    },
    count: () => {
      return shoppingCart.items.reduce((acc, item) => acc + item.qty, 0);
    },
    get: (id) => {
      const index = shoppingCart.items.findIndex((item) => item.id === id);
      return index >= 0 ? shoppingCart.items[index] : null;
    },
    getTotal: () => {
      const total = shoppingCart.items.reduce((acc, item) => {
        const found = db.methods.find(item.id);
        return acc + found.precio + item.qty;
      }, 0);
      return total;
    },
    hasInventory: (id, qty) => {
      return db.items.find((item) => item.id === id).qty - qty >= 0;
    },
    purchase: () => {
      db.methods.remove(shoppingCart.items);
      shoppingCart.items = [];
    },
  },
};

renderStore();
function renderStore() {
  const html = db.items.map((item) => {
    return `
        <div class = "item">
        <div class= "title"> ${item.title}</div>
        <div class= "price"> ${numberToCurrency(item.precio)}</div>
        <div class= "title"> ${item.qty}</div>
        <div class="actions"> 
        <button class="add" data-id="${item.id}">Add to shopping cart</button>
        </div>
        </div>
        `;
  });
  document.querySelector("#store-container").innerHTML = html.join("");
  document.querySelectorAll(".item .actions .add").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      const item = db.methods.find(id);

      if (item && item.qty - 1 > 0) {
        //añadir a carrito
        shoppingCart.methods.add(id, 1);
        renderShoppieCart();
      } else {
        console.log("Ya no hay inventarios");
      }
    });
  });
}
function renderShoppieCart() {
  const html = shoppingCart.items.map((item) => {
    const dbItem = db.methods.find(item.id);
    return `
    <div class = "item">
        <div class= "title"> ${dbItem.title}</div>
        <div class= "price"> ${numberToCurrency(dbItem.precio)}</div>
        <div class= "title"> ${item.qty} units</div>
        <div class="subtotal">
        Subtotal:${numberToCurrency(item.qty * dbItem.precio)}
        </div>
        <div class="actions">
        <button class="addOne" data-id="${item.id}">+</button>
        <button class="removeOne" data-id="${item.id}">-</button>
        </div>
        </div>

    `;
  });

  const closeButton = `
  <div class = "cart-header">
    <button class="bClose">Close</button>
  </div>
  `;
  const purchaseButton =
    shoppingCart.items.length > 0
      ? `
  <div class = "cart-actions">
    <button class="bPurchase">Purchase</button>
  </div>
  `
      : "";

  const total = shoppingCart.methods.getTotal();
  const totalContainer = `<div class="total">Total: ${numberToCurrency(
    total
  )}</div>`;
  const shoppingCartContainer = document.querySelector(
    "#shopping-cart-container"
  );
  shoppingCartContainer.classList.remove("hide");
  shoppingCartContainer.classList.add("show");

  shoppingCartContainer.innerHTML =
    closeButton + html.join("") + totalContainer + purchaseButton;

  document.querySelectorAll(".addOne").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      shoppingCart.methods.add(id, 1);
      renderShoppieCart();
    });
  });
  document.querySelectorAll(".removeOne").forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = parseInt(button.getAttribute("data-id"));
      shoppingCart.methods.remove(id, 1);
      renderShoppieCart();
    });
  });
  document.querySelector(".bClose").addEventListener("click", (e) => {
    shoppingCartContainer.classList.remove("show");
    shoppingCartContainer.classList.add("hide");
  });

  const bPurchase = document.querySelector(".bPurchase");
  if (bPurchase) {
    bPurchase.addEventListener("click", (e) => {
      shoppingCart.methods.purchase();
      renderStore();
      renderShoppieCart();
    });
  }
}

function numberToCurrency(n) {
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: 2,
    style: "currency",
    currency: "USD",
  }).format(n);
}
