import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cardData = [
  {
    image: "Mitthu.jpg", // Remove 'public/' prefix - assume images are in /public folder
    name: "Team Leader: Mitthu Kumar",
    description: "Lorem",
    email: "mitthuji6200@gmail.com",
  },
  {
    image: "Namrata.jpg",
    name: "Design and Idea : Namrata Dey",
    description: "23190503043",
    email: "namratadey45054@gmail.com",
  },
  {
    image: "Aditya.jpg",
    name: "Backend: Shanmukha Aditya",
    description: "23190503042",
    email: "munukutla.23190503042@cuj.ac.in",
    phone: "9676991510",
  },
  {
    image: "Archit.jpg",
    name: "Frontend: Archit Kumar",
    email: "architcuj2028@gmail.com",
    description: "Make it magical",
  },
];

const cardVariants = {
  rest: { scale: 1, y: 0, boxShadow: "0px 0px 0px rgba(0,0,0,0)" },
  hover: {
    scale: 1.05,
    y: -20,
    boxShadow: "0px 10px 20px rgba(168, 85, 247, 0.4)",
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const imageVariants = {
  rest: { opacity: 0, y: 20 },
  hover: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.2, duration: 0.5, ease: "easeOut" },
  },
};

const companySizeOptions = [
  "Please Select",
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1000+ employees",
];

export default function ContactUs() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessEmail: "",
    phoneNumber: "",
    companyName: "",
    companySize: "Please Select",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission (e.g., API call)
    console.log("Form submitted:", formData);
    alert("Thank you! We'll get back to you soon.");
  };

  return (
    <section
      style={{
        background: "#0A0C14",
        color: "white",
        padding: "60px 20px",
        fontFamily: "'Public Sans', Arial, sans-serif",
        maxWidth: 1200,
        margin: "auto",
      }}
    >
      {/* Breadcrumb-like Navigation */}
      <div style={{ marginBottom: "40px", color: "#a0a0a0", fontSize: "0.9rem" }}>
        Home / Contact Us
      </div>

      {/* Main Contact Section: Left Text + Right Form */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "40px",
          alignItems: "start",
          marginBottom: "60px",
        }}
      >
        {/* Left: Questions Text */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ color: "white" }}
        >
          <h2 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#a855f7", marginBottom: "20px" }}>
            Have Questions?
          </h2>
          <h1 style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "20px", color: "white" }}>
            Contact Us
          </h1>
          <p style={{ fontSize: "1.1rem", lineHeight: "1.6", color: "#ccc", marginBottom: "30px" }}>
            Wondering about our pricing, platform, or security solutions? We are happy to answer any questions you may have. 
            Fill out the form on the right, and we'll get back to you right away.
          </p>
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ fontSize: "1.3rem", color: "#a855f7", marginBottom: "15px" }}>Looking for something else?</h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li style={{ marginBottom: "10px", color: "#00ffff" }}>
                • Visit our Careers Page for open job positions. We are hiring!
              </li>
              <li style={{ marginBottom: "10px", color: "#00ffff" }}>
                • Explore the WebRakshak Resource Center for guides, best practices, and insights to help you get the most out of our platform.
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Right: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} style={{ background: "#12131a", padding: "30px", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "15px" }}>
              <input
                type="text"
                name="firstName"
                placeholder="First name *"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                style={{
                  padding: "12px",
                  border: "1px solid #a855f7",
                  borderRadius: 8,
                  background: "transparent",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name *"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                style={{
                  padding: "12px",
                  border: "1px solid #a855f7",
                  borderRadius: 8,
                  background: "transparent",
                  color: "white",
                  fontSize: "1rem",
                }}
              />
            </div>
            <input
              type="email"
              name="businessEmail"
              placeholder="Business email *"
              value={formData.businessEmail}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #a855f7",
                borderRadius: 8,
                background: "transparent",
                color: "white",
                fontSize: "1rem",
                marginBottom: "15px",
              }}
            />
            <input
              type="tel"
              name="phoneNumber"
              placeholder="Phone number *"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #a855f7",
                borderRadius: 8,
                background: "transparent",
                color: "white",
                fontSize: "1rem",
                marginBottom: "15px",
              }}
            />
            <input
              type="text"
              name="companyName"
              placeholder="Company name *"
              value={formData.companyName}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #a855f7",
                borderRadius: 8,
                background: "transparent",
                color: "white",
                fontSize: "1rem",
                marginBottom: "15px",
              }}
            />
            <select
              name="companySize"
              value={formData.companySize}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #a855f7",
                borderRadius: 8,
                background: "transparent",
                color: "white",
                fontSize: "1rem",
                marginBottom: "20px",
              }}
            >
              {companySizeOptions.map((option, idx) => (
                <option key={idx} value={option} style={{ background: "#12131a", color: "white" }}>
                  {option}
                </option>
              ))}
            </select>
            <p style={{ fontSize: "0.8rem", color: "#a0a0a0", marginBottom: "20px" }}>
              By submitting this form, you are agreeing to WebRakshak's{" "}
              <a href="/privacy" style={{ color: "#a855f7" }}>privacy policy</a>{" "}
              and{" "}
              <a href="/terms" style={{ color: "#a855f7" }}>terms of service</a>.
            </p>
            <button
              type="submit"
              style={{
                width: "100%",
                padding: "12px",
                background: "#a855f7",
                border: "none",
                borderRadius: 8,
                color: "white",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Submit
            </button>
          </form>
        </motion.div>
      </div>

      {/* Team Cards Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "24px",
        }}
      >
        {cardData.map((card, idx) => (
          <motion.div
            key={idx}
            variants={cardVariants}
            initial="rest"
            whileHover="hover"
            animate="rest"
            style={{
              background: "#12131a",
              borderRadius: 16,
              width: 240,
              padding: 20,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <motion.div
              variants={imageVariants}
              style={{
                width: "100%",
                height: "140px",
                borderRadius: "16px 16px 0 0",
                overflow: "hidden",
                pointerEvents: "none",
                marginBottom: "10px", // Small gap below image
              }}
            >
              <img
                src={`/${card.image}`}
                alt={card.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Covers the area without distortion, cropping if needed
                  objectPosition: "center", // Centers the image
                  display: "block",
                }}
                loading="lazy"
              />
          
      </motion.div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <h3 style={{ margin: "8px 0", fontWeight: "bold", fontSize: "1.2rem", color: "#a855f7" }}>
          {card.name}
        </h3>
        <p style={{ margin: "6px 0", fontSize: "0.9rem", color: "#ccc" }}>
          {card.description}
        </p>
        <p style={{ fontSize: "0.8rem", color: "#00ffff", cursor: "pointer" }}>
          <a href={`mailto:${card.email}`} style={{ color: "#00ffff", textDecoration: "none" }}>
            {card.email}
          </a>
        </p>
        {card.phone && (
          <p style={{ fontSize: "0.85rem", color: "#ccc", marginTop: 4 }}>
            📞 {card.phone}
          </p>
        )}
      </div>
    </motion.div>
  ))}
</motion.div>
    </section>
  );
}