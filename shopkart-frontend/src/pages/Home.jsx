import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await api.get("/customers/me");
        setCustomer(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    getProfile();
  }, [navigate]);

  if (!customer) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Navbar />

      <main className="home-page">

        {/* Hero Section */}
        <section className="home-hero">
          <p className="home-eyebrow">WELCOME TO SHOPKART</p>

          <h1>
            Everything you need,
            <br />
            all in one place.
          </h1>

          <p className="home-description">
            Discover electronics, fashion, books and everyday essentials
            selected for modern living.
          </p>

          <button className="home-hero-button">
            Explore Collection
          </button>
        </section>

        {/* Categories */}
        <section className="home-categories">
          <div className="home-category">
            <span>⌨️</span>
            <h3>Electronics</h3>
            <p>Tech for everyday life</p>
          </div>

          <div className="home-category">
            <span>👕</span>
            <h3>Fashion</h3>
            <p>Style that fits you</p>
          </div>

          <div className="home-category">
            <span>📚</span>
            <h3>Books</h3>
            <p>Stories worth reading</p>
          </div>

          <div className="home-category">
            <span>🏠</span>
            <h3>Home</h3>
            <p>Make your space better</p>
          </div>
        </section>

        {/* Bottom Banner */}
        <section className="home-banner">
          <h2>Shop smart. Live better.</h2>
          <p>
            Your everyday shopping experience, made simple.
          </p>
        </section>

      </main>
    </>
  );
}

export default Home;