(function () {
  var KEY = "paddleup-cart-v1";

  function read() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function write(lines) {
    localStorage.setItem(KEY, JSON.stringify(lines));
    render();
  }

  function money(cents) {
    return "$" + Math.round(cents / 100);
  }

  function render() {
    var lines = read();
    var count = lines.reduce(function (n, l) { return n + l.qty; }, 0);
    var sub = lines.reduce(function (n, l) { return n + l.qty * l.price; }, 0);
    document.querySelectorAll("[data-cart-count]").forEach(function (el) { el.textContent = String(count); el.classList.toggle("has-items", count > 0); });
    var subEl = document.querySelector("[data-cart-subtotal]");
    if (subEl) subEl.textContent = money(sub);
    var empty = document.querySelector("[data-cart-empty]");
    var list = document.querySelector("[data-cart-lines]");
    if (!list) return;
    list.innerHTML = "";
    if (empty) empty.hidden = lines.length > 0;
    lines.forEach(function (line) {
      var li = document.createElement("li");
      li.textContent = line.qty + " × " + line.name + " · " + line.kind + " · " + line.color + " / " + line.size + " · " + money(line.price * line.qty);
      var remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "Remove";
      remove.addEventListener("click", function () {
        write(read().filter(function (l) { return l.key !== line.key; }));
      });
      li.appendChild(remove);
      list.appendChild(li);
    });
  }

  function add(item) {
    var lines = read();
    var key = [item.slug, item.kind, item.color, item.size].join("|");
    var existing = lines.find(function (l) { return l.key === key; });
    if (existing) existing.qty += item.qty;
    else lines.push(Object.assign({ key: key }, item));
    write(lines);
    var drawer = document.querySelector("[data-cart-drawer]");
    if (drawer) drawer.hidden = false;
  }

  document.addEventListener("click", function (event) {
    var open = event.target.closest("[data-cart-open]");
    var close = event.target.closest("[data-cart-close]");
    var addBtn = event.target.closest("[data-add]");
    if (open) document.querySelector("[data-cart-drawer]").hidden = false;
    if (close || event.target.matches("[data-cart-drawer]")) document.querySelector("[data-cart-drawer]").hidden = true;
    if (event.target.closest("[data-checkout]")) document.querySelector("[data-checkout-note]").hidden = false;
    var menu = document.querySelector("[data-menu]");
    if (menu) {
      if (event.target.closest("[data-menu-open]")) menu.hidden = false;
      if (event.target.closest("[data-menu-close]") || event.target === menu || event.target.closest("[data-menu] nav a")) menu.hidden = true;
    }
    if (!addBtn) return;
    var root = addBtn.closest("[data-product]") || document;
    var kind = (root.querySelector("[data-kind]:checked") || {}).value || addBtn.dataset.kind;
    var color = (root.querySelector("[data-color]:checked") || {}).value || addBtn.dataset.color;
    var size = (root.querySelector("[data-size]:checked") || {}).value || "M";
    var price = Number(addBtn.dataset["price" + kind.charAt(0).toUpperCase() + kind.slice(1)] || addBtn.dataset.price);
    add({
      slug: addBtn.dataset.slug,
      name: addBtn.dataset.name,
      kind: kind,
      color: color,
      size: size,
      price: price,
      qty: 1,
    });
  });

  render();
})();

document.addEventListener("submit", function (event) {
  var form = event.target.closest("[data-inquiry]");
  if (!form) return;
  event.preventDefault();
  var d = new FormData(form);
  var body = "Club: " + d.get("club") + "\nHeadcount: " + d.get("count") + "\nReply to: " + d.get("email") + "\n\n" + (d.get("notes") || "");
  window.location.href = "mailto:hello@paddleuptees.com?subject=" + encodeURIComponent("Club order: " + d.get("club")) + "&body=" + encodeURIComponent(body);
});
