import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/wishlist");

      console.log("WISHLIST DATA:", response.data);

      setWishlist(response.data.wishlist);
    } catch (error) {
      console.error("WISHLIST ERROR:", error);
      setError("Something went wrong while loading your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);

      setWishlist((currentWishlist) =>
        currentWishlist.filter(
          (product) => product._id !== productId
        )
      );
    } catch (error) {
      console.error(error);
      setError("Failed to remove product from wishlist.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="wishlist-page">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>Products you've saved for later.</p>
        </div>

        {loading && (
          <p className="wishlist-message">
            Loading wishlist...
          </p>
        )}

        {error && (
          <p className="wishlist-error">
            {error}
          </p>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="wishlist-empty">
            <h2>Your wishlist is empty</h2>
            <p>
              Save products you like and they'll appear here.
            </p>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-grid">
            {wishlist.map((product) => (
              <div
                className="wishlist-card"
                key={product._id}
              >
                <img
                  src={product.image}
                  alt={product.name}
                />

                <div className="wishlist-card-content">
                  <p className="wishlist-category">
                    {product.category}
                  </p>

                  <h2>{product.name}</h2>

                  <p className="wishlist-price">
                    ₹{product.price}
                  </p>

                  <p className="wishlist-stock">
                    {product.stock > 0
                      ? `In Stock (${product.stock})`
                      : "Out of Stock"}
                  </p>

                  <div className="wishlist-actions">
                    <button
                      onClick={() =>
                        navigate(`/products/${product._id}`)
                      }
                    >
                      View Details
                    </button>

                    <button
                      onClick={() =>
                        handleRemove(product._id)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Wishlist;