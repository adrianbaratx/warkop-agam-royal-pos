import React from "react";
import CustomerOrder from "./CustomerOrder";
import KasirDashboard from "./KasirDashboard";

export default function App() {
  const path = window.location.pathname;

  if (path.startsWith("/order")) {
    return <CustomerOrder />;
  }

  return <KasirDashboard />;
}
