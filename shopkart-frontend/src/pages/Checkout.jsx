import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
import { useState, useEffect } from "react";

function Checkout() {
  const navigate = useNavigate();
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const [shipping, setShipping] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: ""
  });

  const handleChange = (e) => {
    setShipping({
      ...shipping,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!window.Razorpay) {
        alert("Razorpay is still loading. Please try again.");
        return;
      }

      // Step 1: Create the order on our backend
      const response = await api.post("/orders/create-payment-order", {
        shippingAddress: shipping
      });

      const orderData = response.data;

      // Step 2: Configure Razorpay Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ShopKart",
        description: "Order Payment",
        order_id: orderData.razorpayOrderId,

        handler: async function (paymentResponse) {
          try {
            // Step 3: Verify payment on our backend
            const verification = await api.post("/orders/verify-payment", {
              shopKartOrderId: orderData.shopKartOrderId,
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            });

            if (verification.data.success) {
              alert("Payment successful! Your order has been placed.");
              navigate("/home");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error(
              "Payment verification error:",
              error.response?.data || error.message
            );
            alert(
              error.response?.data?.message ||
              "Payment verification failed. Please contact support."
            );
          }
        },

        prefill: {
          name: shipping.fullName,
          contact: shipping.phone
        },

        notes: {
          address: `${shipping.addressLine}, ${shipping.city}, ${shipping.state} - ${shipping.pincode}`
        },

        theme: {
          color: "#2874f0"
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay checkout was closed.");
          }
        }
      };

      const paymentWindow = new window.Razorpay(options);

      paymentWindow.on("payment.failed", function (paymentError) {
        console.error("Payment failed:", paymentError.error);
        alert("Payment failed. Please try again.");
      });

      paymentWindow.open();
    } catch (error) {
      console.error(
        "Checkout error:",
        error.response?.data || error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to start payment. Please try again."
      );
    }
  };



  return (
    <>
      <Navbar />

      <div className="checkout-page">
        <h1>Checkout</h1>
        <p>Enter your shipping details to continue.</p>

        <form onSubmit={handleSubmit} className="checkout-form">
          <label>Full Name</label>
          <input
            name="fullName"
            value={shipping.fullName}
            onChange={handleChange}
            required
          />

          <label>Phone</label>
          <input
            name="phone"
            value={shipping.phone}
            onChange={handleChange}
            type="tel"
            required
          />

          <label>Address</label>
          <input
            name="addressLine"
            value={shipping.addressLine}
            onChange={handleChange}
            required
          />

          <label>City</label>
          <input
            name="city"
            value={shipping.city}
            onChange={handleChange}
            required
          />

          <label>State</label>
          <input
            name="state"
            value={shipping.state}
            onChange={handleChange}
            required
          />

          <label>Pincode</label>
          <input
            name="pincode"
            value={shipping.pincode}
            onChange={handleChange}
            inputMode="numeric"
            required
          />

          <button type="submit">Continue to Payment</button>
        </form>
      </div>
    </>
  );
}

export default Checkout;
