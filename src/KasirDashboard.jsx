import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

const tableList = Array.from({ length: 30 }, (_, index) => index + 1);

const formatRupiah = (number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(number || 0);

const formatDate = (value) => {
  if (!value) return "-";

  if (value.seconds) {
    return new Date(value.seconds * 1000).toLocaleString("id-ID");
  }

  return new Date(value).toLocaleString("id-ID");
};

function readLocalOrders() {
  return JSON.parse(localStorage.getItem("warkop_orders") || "[]");
}

function writeLocalOrders(orders) {
  localStorage.setItem("warkop_orders", JSON.stringify(orders));
  window.dispatchEvent(new Event("storage"));
}

export default function KasirDashboard() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("Pesanan Aktif");
  const [baseUrl, setBaseUrl] = useState(window.location.origin);
  const [paymentMethod, setPaymentMethod] = useState({});

  useEffect(() => {
    if (isFirebaseConfigured && db) {
      const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const firebaseOrders = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));

        setOrders(firebaseOrders);
      });

      return unsubscribe;
    }

    const refreshLocal = () => setOrders(readLocalOrders());
    refreshLocal();

    window.addEventListener("storage", refreshLocal);
    return () => window.removeEventListener("storage", refreshLocal);
  }, []);

  const activeOrders = orders.filter(
    (order) => order.orderStatus !== "Selesai" || order.paymentStatus !== "Sudah Bayar"
  );

  const doneOrders = orders.filter(
    (order) => order.orderStatus === "Selesai" && order.paymentStatus === "Sudah Bayar"
  );

  const shownOrders = activeTab === "Riwayat" ? doneOrders : activeOrders;

  const stats = useMemo(() => {
    const paidOrders = orders.filter((order) => order.paymentStatus === "Sudah Bayar");

    return {
      totalOrders: orders.length,
      activeOrders: activeOrders.length,
      paidOrders: paidOrders.length,
      revenue: paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    };
  }, [orders, activeOrders.length]);

  const updateOrder = async (orderId, payload) => {
    try {
      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, "orders", orderId), payload);
        return;
      }

      const updated = readLocalOrders().map((order) =>
        order.id === orderId ? { ...order, ...payload } : order
      );
      writeLocalOrders(updated);
    } catch (error) {
      console.error(error);
      alert("Gagal update pesanan.");
    }
  };

  const deleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Hapus pesanan ini dari sistem?");
    if (!confirmDelete) return;

    try {
      if (isFirebaseConfigured && db) {
        await deleteDoc(doc(db, "orders", orderId));
        return;
      }

      const updated = readLocalOrders().filter((order) => order.id !== orderId);
      writeLocalOrders(updated);
    } catch (error) {
      console.error(error);
      alert("Gagal menghapus pesanan.");
    }
  };

  const markPaid = async (order) => {
    const method = paymentMethod[order.id] || "Cash";

    await updateOrder(order.id, {
      paymentStatus: "Sudah Bayar",
      paymentMethod: method,
      orderStatus: "Selesai",
      paidAt: isFirebaseConfigured ? new Date() : new Date().toISOString(),
    });
  };

  const printReceipt = (order) => {
    const rows = order.items
      .map(
        (item) =>
          `<tr>
            <td>${item.name} x${item.qty}</td>
            <td style="text-align:right">${formatRupiah(item.subtotal)}</td>
          </tr>`
      )
      .join("");

    const receiptWindow = window.open("", "_blank", "width=380,height=600");

    receiptWindow.document.write(`
      <html>
        <head>
          <title>Struk ${order.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            h2, p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            td { padding: 6px 0; border-bottom: 1px dashed #ccc; font-size: 14px; }
            .total { font-size: 18px; font-weight: bold; margin-top: 12px; display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h2>Warkop Agam Royal</h2>
          <p>Meja: ${order.tableNumber}</p>
          <p>Customer: ${order.customerName || "-"}</p>
          <p>Waktu: ${formatDate(order.createdAt)}</p>
          <table>${rows}</table>
          <div class="total"><span>Total</span><span>${formatRupiah(order.total)}</span></div>
          <p style="margin-top:16px;text-align:center">Terima kasih</p>
          <script>window.print()</script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#111111] text-white">
      <header className="border-b border-zinc-800 bg-[#111111] px-5 py-5">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black text-[#d6a96c]">
              Warkop Agam Royal
            </h1>
            <p className="mt-1 text-zinc-400">Dashboard Kasir & Self Order QR</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#1a1a1a] px-5 py-3">
            <p className="text-sm text-zinc-400">Pendapatan Terbayar</p>
            <p className="text-2xl font-black text-[#d6a96c]">
              {formatRupiah(stats.revenue)}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        {!isFirebaseConfigured && (
          <div className="rounded-3xl border border-yellow-700 bg-yellow-500/10 p-4 text-yellow-100">
            <strong>Mode demo lokal aktif.</strong> Untuk sistem sungguhan,
            isi konfigurasi Firebase di <code>src/firebase.js</code>. Setelah
            Firebase aktif, pesanan dari HP konsumen akan masuk realtime ke
            dashboard kasir.
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
            <p className="text-sm text-zinc-400">Semua Pesanan</p>
            <p className="mt-1 text-3xl font-black">{stats.totalOrders}</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
            <p className="text-sm text-zinc-400">Pesanan Aktif</p>
            <p className="mt-1 text-3xl font-black">{stats.activeOrders}</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
            <p className="text-sm text-zinc-400">Sudah Bayar</p>
            <p className="mt-1 text-3xl font-black">{stats.paidOrders}</p>
          </div>
          <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
            <p className="text-sm text-zinc-400">Total Meja</p>
            <p className="mt-1 text-3xl font-black">30</p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Pesanan Masuk</h2>
                <p className="text-sm text-zinc-400">
                  Pesanan dari konsumen akan tampil di sini.
                </p>
              </div>

              <div className="flex gap-2">
                {["Pesanan Aktif", "Riwayat"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-xl px-4 py-2 text-sm font-bold ${
                      activeTab === tab
                        ? "bg-[#d6a96c] text-black"
                        : "border border-zinc-700 bg-[#111111]"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {shownOrders.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-zinc-700 bg-[#111111] p-8 text-center text-zinc-400">
                  Belum ada pesanan.
                </div>
              ) : (
                shownOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-3xl border border-zinc-800 bg-[#111111] p-5"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-2xl font-black text-[#d6a96c]">
                            Meja {order.tableNumber}
                          </h3>
                          <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-300">
                            {order.orderStatus}
                          </span>
                          <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-200">
                            {order.paymentStatus}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                          {order.customerName || "Customer"} • {formatDate(order.createdAt)}
                        </p>

                        {order.note && (
                          <p className="mt-3 rounded-2xl bg-zinc-900 p-3 text-sm text-zinc-300">
                            Catatan: {order.note}
                          </p>
                        )}
                      </div>

                      <p className="text-2xl font-black text-[#d6a96c]">
                        {formatRupiah(order.total)}
                      </p>
                    </div>

                    <div className="mt-5 space-y-2">
                      {order.items?.map((item) => (
                        <div
                          key={`${order.id}-${item.id}`}
                          className="flex justify-between rounded-2xl bg-[#1a1a1a] p-3"
                        >
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-zinc-400">{item.qty}x</p>
                          </div>
                          <p className="text-[#d6a96c]">
                            {formatRupiah(item.subtotal)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      <select
                        value={order.orderStatus}
                        onChange={(event) =>
                          updateOrder(order.id, { orderStatus: event.target.value })
                        }
                        className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-3 py-3 outline-none"
                      >
                        <option>Pesanan Baru</option>
                        <option>Diproses</option>
                        <option>Siap Diantar</option>
                        <option>Selesai</option>
                      </select>

                      <select
                        value={paymentMethod[order.id] || order.paymentMethod || "Cash"}
                        onChange={(event) =>
                          setPaymentMethod((current) => ({
                            ...current,
                            [order.id]: event.target.value,
                          }))
                        }
                        className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-3 py-3 outline-none"
                      >
                        <option>Cash</option>
                        <option>QRIS</option>
                        <option>Transfer</option>
                        <option>E-Wallet</option>
                      </select>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        onClick={() => markPaid(order)}
                        className="rounded-xl bg-[#d6a96c] px-4 py-3 font-bold text-black"
                      >
                        Bayar & Selesaikan
                      </button>
                      <button
                        onClick={() => printReceipt(order)}
                        className="rounded-xl border border-zinc-700 bg-[#1a1a1a] px-4 py-3 font-bold"
                      >
                        Print Struk
                      </button>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="rounded-xl border border-red-800 bg-red-500/10 px-4 py-3 font-bold text-red-300"
                      >
                        Hapus
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-[#1a1a1a] p-5">
              <h2 className="text-2xl font-bold">QR Self Order Meja</h2>
              <p className="mt-2 text-sm text-zinc-400">
                Link QR harus bisa dibuka dari HP konsumen. Untuk uji coba lewat
                HP, ganti localhost dengan IP laptop, contoh:
                http://192.168.1.10:3000
              </p>

              <input
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                className="mt-4 w-full rounded-xl border border-zinc-700 bg-[#111111] px-4 py-3 text-sm outline-none"
              />

              <div className="mt-5 grid max-h-[760px] grid-cols-2 gap-4 overflow-auto pr-2">
                {tableList.map((table) => {
                  const value = `${baseUrl}/order?table=${table}`;

                  return (
                    <div
                      key={table}
                      className="rounded-2xl border border-zinc-800 bg-[#111111] p-4 text-center"
                    >
                      <div className="rounded-xl bg-white p-3">
                        <QRCode value={value} size={128} className="mx-auto" />
                      </div>
                      <p className="mt-3 font-bold">Meja {table}</p>
                      <a
                        href={value}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block truncate text-xs text-[#d6a96c]"
                      >
                        Buka link
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
