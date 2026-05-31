export function readLocalOrders() {
  try {
    return JSON.parse(localStorage.getItem("warkop_orders") || "[]");
  } catch {
    return [];
  }
}

export function writeLocalOrders(orders) {
  localStorage.setItem("warkop_orders", JSON.stringify(orders));
  window.dispatchEvent(new Event("warkop-orders-updated"));
}

export function addLocalOrder(order) {
  const current = readLocalOrders();
  const newOrder = {
    ...order,
    id: `LOCAL-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  writeLocalOrders([newOrder, ...current]);
  return newOrder;
}
