import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlistIds, setWishlistIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");

      const ids = response.data.wishlist.map(
        (product) => product._id
      );

      setWishlistIds(ids);
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      await api.post(`/wishlist/${productId}`);

      setWishlistIds((currentIds) => [
        ...currentIds,
        productId
      ]);

      return true;
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      return false;
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);

      setWishlistIds((currentIds) =>
        currentIds.filter((id) => id !== productId)
      );

      return true;
    } catch (error) {
      console.error("Failed to remove from wishlist:", error);
      return false;
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const wishlistCount = wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistCount,
        loading,
        addToWishlist,
        removeFromWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}