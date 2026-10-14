import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        setProduct(response.data.product);
      } catch (error) {
        console.error(error);
        setError("Something went wrong while loading the product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <>
        <Navbar />
        <p>Loading product...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <p>{error}</p>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <p>Product not found.</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div>
        <h1>{product.name}</h1>

        <img
          src={product.image}
          alt={product.name}
          width="400"
        />

        <p>{product.description}</p>

        <p>₹{product.price}</p>

        <p>Category: {product.category}</p>

        <p>
          {product.stock > 0
            ? `In Stock (${product.stock})`
            : "Out of Stock"}
        </p>
      </div>
    </>
  );
}

export default ProductDetails;