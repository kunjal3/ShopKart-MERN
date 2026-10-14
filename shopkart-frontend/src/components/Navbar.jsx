import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const handleLogout = async () => {
    try {
      await api.post("/customers/logout");
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  return (
    <nav>
      <h2>ShopKart</h2>

      <div className="nav-links">
        <button
          className={
            location.pathname === "/home"
              ? "active"
              : ""
          }
          onClick={() => navigate("/home")}
        >
          Home
        </button>

        <button
          className={
            location.pathname === "/products"
              ? "active"
              : ""
          }
          onClick={() => navigate("/products")}
        >
          Products
        </button>

        <button
          className={
            location.pathname === "/wishlist"
              ? "active"
              : ""
          }
          onClick={() => navigate("/wishlist")}
        >
          Wishlist ({wishlistCount})
        </button>

        <button
          className={
            location.pathname === "/cart"
              ? "active"
              : ""
          }
          onClick={() => navigate("/cart")}
        >
          Cart ({cartCount})
        </button>
        <button
          className={
            location.pathname === "/orders"
              ? "active"
              : ""
          }
          onClick={() => navigate("/orders")}
        >
          My Orders
        </button>

        <button onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;