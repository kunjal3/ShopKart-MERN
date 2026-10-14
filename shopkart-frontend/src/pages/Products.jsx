import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [wishlistIds, setWishlistIds] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(null);
  const [wishlistError, setWishlistError] = useState("");

  const [cartLoading, setCartLoading] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const { addToCart } = useCart();

  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    fetchProducts();
  }, [search, category]);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {};

      if (search) {
        params.search = search;
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get("/products", {
        params: params
      });

      setProducts(response.data.products);
    } catch (error) {
      console.error(error);
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");

      const ids = response.data.wishlist.map(
        (product) => product._id
      );

      setWishlistIds(ids);
    } catch (error) {
      console.error("Could not load wishlist:", error);
    }
  };

  const handleWishlistToggle = async (productId) => {
    if (wishlistLoading === productId) {
      return;
    }

    try {
      setWishlistLoading(productId);
      setWishlistError("");

      if (wishlistIds.includes(productId)) {
        await api.delete(`/wishlist/${productId}`);

        setWishlistIds((currentIds) =>
          currentIds.filter((id) => id !== productId)
        );

        return;
      }

      await api.post(`/wishlist/${productId}`);

      setWishlistIds((currentIds) => [
        ...currentIds,
        productId
      ]);
    } catch (error) {
      console.error(error);
      setWishlistError("Failed to update wishlist.");
    } finally {
      setWishlistLoading(null);
    }
  };

  const handleAddToCart = async (productId) => {
    if (cartLoading === productId) {
      return;
    }

    try {
      setCartLoading(productId);
      setCartMessage("");

      const success = await addToCart(productId);

      if (success) {
        setCartMessage("Product added to cart.");
      }
    } catch (error) {
      console.error("Failed to add product to cart:", error);
    } finally {
      setCartLoading(null);
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;

    setSearchParams((currentParams) => {
      if (value) {
        currentParams.set("search", value);
      } else {
        currentParams.delete("search");
      }

      return currentParams;
    });
  };

  const handleCategoryChange = (event) => {
    const value = event.target.value;

    setSearchParams((currentParams) => {
      if (value) {
        currentParams.set("category", value);
      } else {
        currentParams.delete("category");
      }

      return currentParams;
    });
  };

  return (
    <>
      <Navbar />

      <div>
        <h1>Products</h1>

        <div className="product-filters">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={handleSearchChange}
          />

          <select
            value={category}
            onChange={handleCategoryChange}
          >
            <option value="">All Categories</option>
            <option value="Electronics">Electronics</option>
            <option value="Fashion">Fashion</option>
            <option value="Books">Books</option>
            <option value="Home">Home</option>
          </select>
        </div>

        {wishlistError && (
          <p className="wishlist-error">
            {wishlistError}
          </p>
        )}

        {cartMessage && (
          <p className="cart-message">
            {cartMessage}
          </p>
        )}

        {loading && <p>Loading products...</p>}

        {error && <p>{error}</p>}

        {!loading && !error && products.length === 0 && (
          <p>No products found.</p>
        )}

        {!loading &&
          !error &&
          products.map((product) => (
            <div
              key={product._id}
              className="product-card"
            >
              <button
                className={`wishlist-button ${
                  wishlistIds.includes(product._id)
                    ? "wishlist-added"
                    : ""
                }`}
                onClick={() =>
                  handleWishlistToggle(product._id)
                }
                disabled={
                  wishlistLoading === product._id
                }
              >
                {wishlistLoading === product._id
                  ? "Saving..."
                  : wishlistIds.includes(product._id)
                  ? "♥ Remove from Wishlist"
                  : "♡ Add to Wishlist"}
              </button>

              <img
                src={product.image}
                alt={product.name}
                width="200"
              />

              <h2>{product.name}</h2>

              <p>{product.description}</p>

              <p>₹{product.price}</p>

              <p>Category: {product.category}</p>

              <p>
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : "Out of Stock"}
              </p>

              {/* Add to Cart */}
              <button
                className="add-to-cart-button"
                onClick={() =>
                  handleAddToCart(product._id)
                }
                disabled={
                  product.stock === 0 ||
                  cartLoading === product._id
                }
              >
                {cartLoading === product._id
                  ? "Adding..."
                  : product.stock === 0
                  ? "Out of Stock"
                  : "Add to Cart"}
              </button>

              {/* View Details */}
              <button
                className="view-details-button"
                onClick={() =>
                  navigate(`/products/${product._id}`)
                }
              >
                View Details
              </button>
            </div>
          ))}
      </div>
    </>
  );
}

export default Products;