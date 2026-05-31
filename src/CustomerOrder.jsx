import React, { useMemo, useState } from "react";
import { push, ref, set } from "firebase/database";
import { db, isFirebaseConfigured } from "./firebase";
import { addLocalOrder } from "./localStore";
import menuItems from "./MenuData";

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);

export default function CustomerOrder() {
  const searchParams = new URLSearchParams(window.location.search);
  const tableFromUrl = searchParams.get("table") || "";

  const [tableNumber, setTableNumber] = useState(tableFromUrl);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [note, setNote] = useState("");
  const [category, setCategory] = useState("Semua");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  const categories = useMemo(() => {
    return ["Semua", ...new Set(menuItems.map((item) => item.category))];
  }, []);

  const filteredMenu = useMemo(() => {
    if (category === "Semua") return menuItems;
    return menuItems.filter((item) => item.category === category);
  }, [category]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const serviceFee = subtotal > 0 ? 5000 : 0;
  const total = subtotal + serviceFee;

  const addToCart = (menu) => {
    setCart((current) => {
      const existing = current.find((item) => item.id === menu.id);

      if (existing) {
        return current.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      return [...current, { ...menu, qty: 1 }];
    });
  };

  const decreaseQty = (menuId) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === menuId ? { ...item, qty: item.qty - 1 } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const submitOrder = async () => {
    if (!tableNumber) {
      alert("Nomor meja belum diisi.");
      return;
    }

    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    const orderData = {
      tableNumber: String(tableNumber),
      customerName: customerName || "Customer",
      note,
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        qty: item.qty,
        subtotal: item.price * item.qty,
      })),
      subtotal,
      serviceFee,
      total,
      orderStatus: "Pesanan Baru",
      paymentStatus: "Belum Bayar",
      paymentMethod: "",
      source: "Self Order QR",
      createdAt: new Date().toISOString(),
    };

    try {
      setIsSubmitting(true);

      let savedOrder;

      if (isFirebaseConfigured && db) {
        const newOrderRef = push(ref(db, "orders"));
        savedOrder = {
          ...orderData,
          id: newOrderRef.key,
        };

        await set(newOrderRef, savedOrder);
      } else {
        savedOrder = addLocalOrder(orderData);
      }

      setSuccessOrder(savedOrder);
      setCart([]);
      setNote("");
      setCustomerName("");
    } catch (error) {
      console.error(error);
      alert("Pesanan gagal dikirim. Periksa koneksi atau konfigurasi Realtime Database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="min-h-screen bg-[#111111] px-4 py-8 text-white">
        <div className="mx-auto max-w-xl rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-6 shadow-2xl">
          <div className="mb-5 rounded-2xl bg-green-500/10 p-4 text-green-300">
            Pesanan berhasil dikirim ke kasir.
          </div>

          <h1 className="text-3xl font-black text-[#d6a96c]">
            Warkop Agam Royal
          </h1>
          <p className="mt-2 text-zinc-400">Nomor pesanan: {successOrder.id}</p>
          <p className="text-zinc-400">Meja: {successOrder.tableNumber}</p>

          <div className="mt-6 space-y-3">
            {successOrder.items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between rounded-2xl bg-[#111111] p-4"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-zinc-400">{item.qty}x</p>
                </div>
                <p className="font-bold text-[#d6a96c]">
                  {formatRupiah(item.subtotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span className="text-[#d6a96c]">
                {formatRupiah(successOrder.total)}
              </span>
            </div>
          </div>

          <button
            onClick={() => setSuccessOrder(null)}
            className="mt-6 w-full rounded-2xl bg-[#d6a96c] py-3 font-black text-black"
          >
            Pesan Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="sticky top-0 z-20 border-b border-zinc-800 bg-[#111111]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#d6a96c]">
              Warkop Agam Royal
            </h1>
            <p className="text-sm text-zinc-400">Self Order QR Menu</p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm text-zinc-400">Meja</label>
            <input
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              className="w-24 rounded-xl border border-zinc-700 bg-[#1a1a1a] px-3 py-2 text-center outline-none"
              placeholder="1"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-5 flex flex-wrap gap-3">
            {categories.map((item) => (
              <button
                key={item}
                onClick={() => setCategory(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold ${
                  category === item
                    ? "bg-[#d6a96c] text-black"
                    : "border border-zinc-700 bg-[#1a1a1a] text-zinc-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {filteredMenu.map((menu) => (
              <article
                key={menu.id}
                className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#1a1a1a] shadow-xl"
              >
                <img
                  src={menu.image}
                  alt={menu.name}
                  className="h-44 w-full object-cover"
                />

                <div className="p-5">
                  <p className="text-xs uppercase tracking-widest text-zinc-500">
                    {menu.category}
                  </p>
                  <h2 className="mt-1 text-xl font-black">{menu.name}</h2>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-lg font-black text-[#d6a96c]">
                      {formatRupiah(menu.price)}
                    </p>
                    <button
                      onClick={() => addToCart(menu)}
                      className="rounded-xl bg-[#d6a96c] px-4 py-2 font-black text-black"
                    >
                      Tambah
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5 shadow-2xl lg:sticky lg:top-24">
          <h2 className="text-2xl font-black">Keranjang</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Meja {tableNumber || "-"}
          </p>

          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="mt-4 w-full rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 outline-none"
            placeholder="Nama customer opsional"
          />

          <div className="mt-5 space-y-3">
            {cart.length === 0 ? (
              <p className="rounded-2xl bg-[#111111] p-4 text-sm text-zinc-400">
                Belum ada menu dipilih.
              </p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-zinc-800 bg-[#111111] p-4"
                >
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="font-bold">{item.name}</p>
                      <p className="text-sm text-zinc-400">
                        {formatRupiah(item.price)}
                      </p>
                    </div>
                    <p className="font-black text-[#d6a96c]">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={() => decreaseQty(item.id)}
                      className="h-9 w-9 rounded-lg bg-zinc-800 font-black"
                    >
                      -
                    </button>
                    <span className="font-black">{item.qty}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="h-9 w-9 rounded-lg bg-[#d6a96c] font-black text-black"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="mt-4 min-h-24 w-full rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 outline-none"
            placeholder="Catatan pesanan, contoh: less sugar, pedas, tanpa es"
          />

          <div className="mt-5 space-y-2 border-t border-zinc-800 pt-5">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Service</span>
              <span>{formatRupiah(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-xl font-black">
              <span>Total</span>
              <span className="text-[#d6a96c]">{formatRupiah(total)}</span>
            </div>
          </div>

          <button
            onClick={submitOrder}
            disabled={isSubmitting}
            className="mt-6 w-full rounded-2xl bg-[#d6a96c] py-3 text-lg font-black text-black disabled:opacity-60"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Pesanan ke Kasir"}
          </button>

          {!isFirebaseConfigured && (
            <p className="mt-4 rounded-2xl border border-yellow-700 bg-yellow-500/10 p-3 text-xs text-yellow-100">
              Mode demo lokal aktif. Agar pesanan dari HP konsumen masuk ke laptop kasir realtime,
              isi databaseURL Realtime Database di src/firebase.js.
            </p>
          )}
        </aside>
      </main>
    </div>
  );
}