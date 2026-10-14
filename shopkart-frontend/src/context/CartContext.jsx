import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET /cart
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/cart");

      setCartItems(response.data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setError("Failed to load cart.");
    } finally {
      setLoading(false);
    }
  };

  // ADD /cart/:productId
  const addToCart = async (productId) => {
    try {
      setError("");

      await api.post(`/cart/${productId}`);

      await fetchCart();

      return true;
    } catch (error) {
      console.error("Failed to add to cart:", error);

      setError(
        error.response?.data?.message ||
        "Failed to add product to cart."
      );

      return false;
    }
  };

  // PATCH /cart/:productId
  const updateQuantity = async (productId, quantity) => {
    try {
      setError("");

      await api.patch(
        `/cart/${productId}`,
        { quantity }
      );

      await fetchCart();

      return true;
    } catch (error) {
      console.error("Failed to update quantity:", error);

      setError(
        error.response?.data?.message ||
        "Failed to update cart quantity."
      );

      return false;
    }
  };

  // DELETE /cart/:productId
  const removeFromCart = async (productId) => {
    try {
      setError("");

      await api.delete(`/cart/${productId}`);

      await fetchCart();

      return true;
    } catch (error) {
      console.error("Failed to remove from cart:", error);

      setError(
        error.response?.data?.message ||
        "Failed to remove product from cart."
      );

      return false;
    }
  };

  // Total number of products
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Subtotal
  const cartSubtotal = cartItems.reduce(
    (total, item) =>
      total + item.product.price * item.quantity,
    0
  );

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}