import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useCart } from "../context/CartContext";

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    loading,
    error,
    cartSubtotal,
    updateQuantity,
    removeFromCart
  } = useCart();

  const handleIncrease = async (item) => {
    if (item.quantity >= item.product.stock) {
      return;
    }

    await updateQuantity(
      item.product._id,
      item.quantity + 1
    );
  };

  const handleDecrease = async (item) => {
    if (item.quantity <= 1) {
      return;
    }

    await updateQuantity(
      item.product._id,
      item.quantity - 1
    );
  };

  const handleRemove = async (productId) => {
    await removeFromCart(productId);
  };

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <p>Review your products before checkout.</p>
        </div>

        {loading && (
          <p className="cart-message">
            Loading cart...
          </p>
        )}

        {error && (
          <p className="cart-error">
            {error}
          </p>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="cart-empty">
            <h2>Your cart is empty</h2>

            <p>
              Add some products to your cart and they
              will appear here.
            </p>

            <button
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="cart-layout">

            <div className="cart-items">
              {cartItems.map((item) => (
                <div
                  className="cart-item"
                  key={item.product._id}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                  />

                  <div className="cart-item-details">
                    <p className="cart-category">
                      {item.product.category}
                    </p>

                    <h2>{item.product.name}</h2>

                    <p className="cart-price">
                      ₹{item.product.price}
                    </p>

                    <p>
                      Stock available:{" "}
                      {item.product.stock}
                    </p>

                    <div className="quantity-controls">
                      <button
                        onClick={() =>
                          handleDecrease(item)
                        }
                        disabled={item.quantity <= 1}
                      >
                        −
                      </button>

                      <span>
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          handleIncrease(item)
                        }
                        disabled={
                          item.quantity >=
                          item.product.stock
                        }
                      >
                        +
                      </button>
                    </div>

                    {item.quantity === 1 && (
                      <button
                        className="cart-remove"
                        onClick={() =>
                          handleRemove(
                            item.product._id
                          )
                        }
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="cart-item-total">
                    ₹
                    {item.product.price *
                      item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <aside className="cart-summary">
              <h2>Order Summary</h2>

              <div className="cart-summary-row">
                <span>Total Items</span>

                <span>
                  {cartItems.reduce(
                    (total, item) =>
                      total + item.quantity,
                    0
                  )}
                </span>
              </div>

              <div className="cart-summary-row">
                <span>Subtotal</span>

                <span>
                  ₹{cartSubtotal}
                </span>
              </div>

              <hr />

              <div className="cart-summary-total">
                <span>Total</span>

                <span>
                  ₹{cartSubtotal}
                </span>
              </div>

              <button
                className="checkout-button"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>

              <button
                className="continue-shopping"
                onClick={() =>
                  navigate("/products")
                }
              >
                Continue Shopping
              </button>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default Cart;