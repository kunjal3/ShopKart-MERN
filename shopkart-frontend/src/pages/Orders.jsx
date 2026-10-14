
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import "./Orders.css";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data.orders || []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load your orders. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  return (
    <>
      <Navbar />

      <main className="orders-page">
        <h1>My Orders</h1>
        <p className="orders-subtitle">
          Track your purchases and payment status.
        </p>

        {loading && <p>Loading your orders...</p>}

        {!loading && error && (
          <div className="orders-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="orders-empty">
            <h2>No orders yet</h2>
            <p>Your placed orders will appear here.</p>
            <button onClick={() => navigate("/products")}>
              Explore Products
            </button>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="orders-list">
            {orders.map((order) => (
              <article className="order-card" key={order._id}>
                <div className="order-header">
                  <div>
                    <span className="order-label">Order ID</span>
                    <p className="order-id">{order._id}</p>
                  </div>

                  <span
                    className={`order-status ${
                      order.orderStatus === "PLACED"
                        ? "status-placed"
                        : ""
                    }`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="order-items">
                  {order.items?.map((item, index) => (
                    <div
                      className="order-item"
                      key={item.product || index}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="order-image-placeholder">
                          No image
                        </div>
                      )}

                      <div className="order-item-details">
                        <h3>{item.name}</h3>
                        <p>Quantity: {item.quantity}</p>
                        <p>
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-footer">
                  <div>
                    <span className="order-label">Order date</span>
                    <p>{formatDate(order.createdAt)}</p>
                  </div>

                  <div>
                    <span className="order-label">Payment</span>
                    <p>{order.paymentStatus}</p>
                  </div>

                  <div>
                    <span className="order-label">Total</span>
                    <p className="order-total">
                      ₹{Number(order.totalAmount).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {order.paymentStatus === "PAID" &&
                  order.orderStatus === "PLACED" && (
                    <p className="order-success">
                      ✓ Order placed successfully!
                    </p>
                  )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Orders;
