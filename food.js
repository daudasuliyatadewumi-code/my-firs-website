
document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const cartButton = $("cart-button");
  const cartCount = $("cart-count");
  const panelCartCount = $("panel-cart-count");
  const cartPanel = $("cart-panel");
  const cartOverlay = $("cart-overlay");
  const closeCartButton = $("close-cart");
  const cartItems = $("cart-items");
  const emptyCart = $("empty-cart");
  const cartSubtotal = $("cart-subtotal");
  const cartDelivery = $("cart-delivery");
  const cartTotal = $("cart-total");
  const clearCartButton = $("clear-cart");
  const checkoutButton = $("checkout-button");

  const deliveryPage = $("delivery");
  const menuPage = $("menu");
  const deliveryForm = $("delivery-form");
  const deliveryOrderItems = $("delivery-order-items");
  const deliverySubtotal = $("delivery-subtotal");
  const deliveryFee = $("delivery-fee");
  const deliveryTotal = $("delivery-total");

  const money = (value) => Math.round(value).toLocaleString("en-NG");

  const DELIVERY_FEE = 1000;
  const STORAGE_KEY = "abekesKitchenCart";

  let cart = [];

  // Restore saved cart safely.
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (Array.isArray(saved)) {
      cart = saved.filter((item) =>
        item &&
        typeof item.name === "string" &&
        Number.isFinite(item.price) &&
        item.price >= 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
      );
    }
  } catch (error) {
    console.warn("The saved cart could not be loaded.", error);
  }

  function saveCart() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn("Cart could not be saved in this browser.", error);
    }
  }

  function subtotalAmount() {
    return cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  function totalQuantity() {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  function deliveryAmount() {
    return cart.length > 0 ? DELIVERY_FEE : 0;
  }

  function totalAmount() {
    return subtotalAmount() + deliveryAmount();
  }

  function openCart() {
    cartPanel.classList.add("open");
    cartPanel.setAttribute("aria-hidden", "false");
    cartPanel.removeAttribute("inert");
    cartOverlay.hidden = false;
    document.body.classList.add("cart-open");
    closeCartButton.focus();
  }

  function closeCart() {
    cartPanel.classList.remove("open");
    cartPanel.setAttribute("aria-hidden", "true");
    cartPanel.setAttribute("inert", "");
    cartOverlay.hidden = true;
    document.body.classList.remove("cart-open");
  }

  function changeQuantity(name, change) {
    const item = cart.find((entry) => entry.name === name);
    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
      cart = cart.filter((entry) => entry.name !== name);
    }

    updateCart();
  }

  function addToCart(name, price) {
    const existing = cart.find((item) => item.name === name);

    if (existing) {
      existing.quantity++;
    } else {
      cart.push({ name, price, quantity: 1 });
    }

    updateCart();
    openCart();
  }

  function renderCartItems() {
    cartItems.replaceChildren();

    cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-item";

      const details = document.createElement("div");
      const name = document.createElement("h3");
      name.textContent = item.name;

      const price = document.createElement("p");
      price.className = "cart-item-price";
      price.textContent = `₦${money(item.price * item.quantity)}`;

      const controls = document.createElement("div");
      controls.className = "quantity-controls";

      const minus = document.createElement("button");
      minus.type = "button";
      minus.textContent = "−";
      minus.setAttribute("aria-label", `Remove one ${item.name}`);
      minus.addEventListener("click", () => changeQuantity(item.name, -1));

      const qty = document.createElement("span");
      qty.textContent = item.quantity;

      const plus = document.createElement("button");
      plus.type = "button";
      plus.textContent = "+";
      plus.setAttribute("aria-label", `Add one ${item.name}`);
      plus.addEventListener("click", () => changeQuantity(item.name, 1));

      controls.append(minus, qty, plus);
      details.append(name, price, controls);

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "remove-item";
      remove.textContent = "Remove";
      remove.addEventListener("click", () => {
        cart = cart.filter((entry) => entry.name !== item.name);
        updateCart();
      });

      row.append(details, remove);
      cartItems.appendChild(row);
    });
  }

  function renderDeliverySummary() {
    deliveryOrderItems.replaceChildren();

    if (cart.length === 0) {
      const message = document.createElement("p");
      message.textContent = "Your cart is empty. Return to the menu to add food.";
      deliveryOrderItems.appendChild(message);
    } else {
      cart.forEach((item) => {
        const row = document.createElement("div");
        row.className = "order-summary-item";

        const name = document.createElement("span");
        name.textContent = `${item.name} × ${item.quantity}`;

        const price = document.createElement("strong");
        price.textContent = `₦${money(item.price * item.quantity)}`;

        row.append(name, price);
        deliveryOrderItems.appendChild(row);
      });
    }

    deliverySubtotal.textContent = `₦${money(subtotalAmount())}`;
    deliveryFee.textContent = `₦${money(deliveryAmount())}`;
    deliveryTotal.textContent = `₦${money(totalAmount())}`;
  }

  function updateCart() {
    cartCount.textContent = totalQuantity();
    panelCartCount.textContent = totalQuantity();

    cartSubtotal.textContent = money(subtotalAmount());
    cartDelivery.textContent = money(deliveryAmount());
    cartTotal.textContent = money(totalAmount());

    emptyCart.hidden = cart.length > 0;
    checkoutButton.disabled = cart.length === 0;
    clearCartButton.disabled = cart.length === 0;

    renderCartItems();
    renderDeliverySummary();
    saveCart();
  }

  // Category filters.
  const categoryButtons = document.querySelectorAll(".category-btn");
  const foodCards = document.querySelectorAll(".food-card");

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const category = button.dataset.category;

      categoryButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
      });

      foodCards.forEach((card) => {
        card.hidden =
          category !== "All" &&
          card.dataset.category !== category;
      });
    });
  });

  // Add food items.
  document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.name;
      const price = Number(button.dataset.price);

      if (!name || !Number.isFinite(price) || price < 0) {
        alert("This menu item has an invalid name or price.");
        return;
      }

      addToCart(name, price);
    });
  });

  cartButton.addEventListener("click", openCart);
  closeCartButton.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeCart();
  });

  clearCartButton.addEventListener("click", () => {
    cart = [];
    updateCart();
  });

  // Navigate to the delivery page without losing the cart.
  checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) return;

    closeCart();
    menuPage.hidden = true;
    deliveryPage.hidden = false;
    renderDeliverySummary();
    deliveryPage.scrollIntoView({ behavior: "smooth" });
  });

  $("back-to-menu").addEventListener("click", () => {
    deliveryPage.hidden = true;
    menuPage.hidden = false;
    menuPage.scrollIntoView({ behavior: "smooth" });
  });

  // Clicking Delivery in the navigation opens the delivery page.
  $("delivery-link").addEventListener("click", (event) => {
    event.preventDefault();
    closeCart();
    menuPage.hidden = true;
    deliveryPage.hidden = false;
    renderDeliverySummary();
    deliveryPage.scrollIntoView({ behavior: "smooth" });
  });

  // WhatsApp order submission.
  deliveryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty. Please add food before placing an order.");
      deliveryPage.hidden = true;
      menuPage.hidden = false;
      menuPage.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const form = new FormData(deliveryForm);

    const customerName = String(form.get("name") || "").trim();
    const customerPhone = String(form.get("phone") || "").trim();
    const address = String(form.get("address") || "").trim();
    const area = String(form.get("area") || "").trim();
    const instructions = String(form.get("instructions") || "").trim();
    const payment = String(form.get("payment") || "");

    if (!customerName || !customerPhone || !address || !area) {
      alert("Please complete your name, phone number and delivery address.");
      return;
    }

    // Replace the placeholder in index.html with your real WhatsApp
    // number, including country code and without +, spaces or dashes.
    const whatsapp = document.body.dataset.whatsapp.trim();

    if (!/^234\d{10}$/.test(whatsapp)) {
      alert(
        "Please add your restaurant's real WhatsApp number in index.html. " +
        "Find data-whatsapp on the body tag and replace 234XXXXXXXXXX."
      );
      return;
    }

    const lines = [
      "*NEW FOOD ORDER — ABEKE'S KITCHEN*",
      "",
      `Customer: ${customerName}`,
      `Phone: ${customerPhone}`,
      `Address: ${address}`,
      `Area: ${area}`,
      `Delivery instructions: ${instructions || "None"}`,
      "",
      "*ORDER ITEMS*",
      ...cart.map(
        (item) =>
          `${item.name} × ${item.quantity} = ₦${money(item.price * item.quantity)}`
      ),
      "",
      `Subtotal: ₦${money(subtotalAmount())}`,
      `Delivery fee: ₦${money(deliveryAmount())}`,
      `*TOTAL: ₦${money(totalAmount())}*`,
      `Preferred payment: ${payment}`,
      "",
      "Please confirm availability, delivery fee and payment arrangements."
    ];

    const message = encodeURIComponent(lines.join("\n"));
    const whatsappURL = `https://wa.me/${whatsapp}?text=${message}`;

    window.open(whatsappURL, "_blank", "noopener,noreferrer");
  });

  updateCart();
});