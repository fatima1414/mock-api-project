import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import ViewLayout from "./viewLayout";

const API = "https://68be829f9c70953d96ec8200.mockapi.io/api/romm-furniture";

export default function Home() {
  const [layouts, setLayouts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  /* ---------- Fetch ---------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(API);
        setLayouts(res.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const finalPrice = (price, discount) =>
    discount && discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  /* ---------- Derived List ---------- */
  const filteredAndSorted = useMemo(() => {
    let data = layouts;
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item) => item.roomName.toLowerCase().includes(lower));
    }
    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        const key = sortConfig.key;
        const dir = sortConfig.direction === "asc" ? 1 : -1;

        if (key === "finalPrice") {
          return (
            (finalPrice(a.price, a.discount || 0) -
              finalPrice(b.price, b.discount || 0)) * dir
          );
        }

        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === "string")
          return aVal.localeCompare(bVal, undefined, { sensitivity: "base" }) * dir;
        return (aVal - bVal) * dir;
      });
    }
    return data;
  }, [layouts, searchTerm, sortConfig]);

  /* ---------- Handlers ---------- */
  const removeLayout = async (id) => {
    if (window.confirm("Delete this layout?")) {
      await axios.delete(`${API}/${id}`);
      setLayouts((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const openModal = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedRoom(null);
  };

  /* ---------- UI ---------- */
  return (
    <div className="container my-5">
      {/* === Page Header === */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-3">
        <h1 className="fw-bold text-primary">Room Furniture</h1>

        <div className="d-flex flex-wrap gap-2">
          <input
            type="text"
            className="form-control shadow-sm"
            style={{ minWidth: 220 }}
            placeholder="Search by room name…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="form-select shadow-sm"
            style={{ minWidth: 180 }}
            value={sortConfig.key ? `${sortConfig.key}-${sortConfig.direction}` : ""}
            onChange={(e) => {
              const [key, dir] = e.target.value.split("-");
              if (key) setSortConfig({ key, direction: dir });
              else setSortConfig({ key: null, direction: null });
            }}
          >
            <option value="">Sort by…</option>
            <option value="roomName-asc">Name ↑</option>
            <option value="roomName-desc">Name ↓</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="discount-asc">Discount ↑</option>
            <option value="discount-desc">Discount ↓</option>
            <option value="finalPrice-asc">Final Price ↑</option>
            <option value="finalPrice-desc">Final Price ↓</option>
          </select>

          <NavLink to="/add-std" className="btn btn-primary shadow-sm">
            + Add Layout
          </NavLink>
        </div>
      </div>

      {/* === Product Grid === */}
      {filteredAndSorted.length === 0 && (
        <p className="text-center text-muted fs-5">No rooms match your search.</p>
      )}

      <div className="row g-4">
        {filteredAndSorted.map((r) => {
          const fPrice = finalPrice(r.price, r.discount || 0);
          const outOfStock = r.available === false;

          return (
            <div key={r.id} className="col-sm-6 col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 rounded-4">
                {/* Image */}
                {r.image ? (
                  <img
                    src={r.image}
                    className="card-img-top rounded-top-4"
                    alt={r.roomName}
                    style={{ height: 180, objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="d-flex justify-content-center align-items-center bg-light rounded-top-4"
                    style={{ height: 180 }}
                  >
                    <span className="text-muted">No Image</span>
                  </div>
                )}

                {/* Body */}
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-capitalize fw-semibold mb-1">
                    {r.roomName}
                  </h5>
                  <p className="text-muted small mb-2">
                    {r.width} × {r.length} ft
                  </p>

                  <div className="mb-2">
                    {r.discount > 0 && (
                      <span className="badge bg-danger me-2">
                        -{r.discount}%
                      </span>
                    )}
                    <span
                      className={`fw-bold ${
                        r.discount > 0 ? "text-decoration-line-through text-muted" : ""
                      }`}
                    >
                      ₹{r.price}
                    </span>
                    {r.discount > 0 && (
                      <span className="fw-bold text-success ms-2">₹{fPrice}</span>
                    )}
                  </div>

                  <span
                    className={`badge ${outOfStock ? "bg-danger" : "bg-success"} mb-3`}
                  >
                    {outOfStock ? "Out of Stock" : "In Stock"}
                  </span>

                  <div className="mt-auto d-flex justify-content-between gap-2">
                    <button
                      onClick={() => openModal(r)}
                      className="btn btn-sm btn-outline-primary flex-fill"
                      title="View"
                    >
                      <FaEye />
                    </button>
                    <NavLink
                      to={`/update-std/${r.id}`}
                      className="btn btn-sm btn-outline-warning flex-fill"
                      title="Edit"
                    >
                      <FaPencil />
                    </NavLink>
                    <button
                      onClick={() => removeLayout(r.id)}
                      className="btn btn-sm btn-outline-danger flex-fill"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* === Modal for View === */}
      {showModal && (
        <div
          className="modal fade show"
          style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={closeModal}
        >
          <div
            className="modal-dialog modal-lg modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedRoom?.roomName}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <ViewLayout room={selectedRoom} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
