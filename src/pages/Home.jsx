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

  /* ---------------- Fetch Data ---------------- */
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

  /* ---------------- Utilities ---------------- */
  const finalPrice = (price, discount) =>
    discount && discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  /* ---------------- Derived List ---------------- */
  const filteredAndSorted = useMemo(() => {
    let data = layouts;

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item) => item.roomName.toLowerCase().includes(lower));
    }

    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        const key = sortConfig.key;

        if (key === "finalPrice") {
          const aVal = finalPrice(a.price, a.discount || 0);
          const bVal = finalPrice(b.price, b.discount || 0);
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aVal = a[key];
        const bVal = b[key];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal, undefined, { sensitivity: "base" })
            : bVal.localeCompare(aVal, undefined, { sensitivity: "base" });
        }

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [layouts, searchTerm, sortConfig]);

  /* ---------------- Handlers ---------------- */
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

  /* ---------------- Render ---------------- */
  return (
    <div className="container my-5">
      {/* Top bar with title, search, nicely styled sort box, and add button */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="fw-bold text-dark mb-0">Room Layouts</h2>

        <div className="d-flex flex-wrap gap-2 align-items-center">
          <input
            type="text"
            placeholder="Search by room name..."
            className="form-control"
            style={{ minWidth: 200 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* 🌟 Styled sort dropdown */}
          <select
            className="form-select border-primary text-primary fw-semibold shadow-sm"
            style={{
              minWidth: 180,
              borderRadius: "0.5rem",
            }}
            value={sortConfig.key ? `${sortConfig.key}-${sortConfig.direction}` : ""}
            onChange={(e) => {
              const [key, dir] = e.target.value.split("-");
              if (key) setSortConfig({ key, direction: dir });
              else setSortConfig({ key: null, direction: null });
            }}
          >
            <option value="">Sort by…</option>
            <option value="roomName-asc">Room ↑</option>
            <option value="roomName-desc">Room ↓</option>
            <option value="price-asc">Price ↑</option>
            <option value="price-desc">Price ↓</option>
            <option value="discount-asc">Discount ↑</option>
            <option value="discount-desc">Discount ↓</option>
            <option value="finalPrice-asc">Final Price ↑</option>
            <option value="finalPrice-desc">Final Price ↓</option>
          </select>
        </div>

        <NavLink to="/add-std" className="btn btn-primary px-4 py-2 shadow-sm">
          Add Layout
        </NavLink>
      </div>

      {/* Table */}
      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Room</th>
              <th>Dimensions</th>
              <th>MRP</th>
              <th>Discount</th>
              <th>Final Price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((r, i) => {
              const fPrice = finalPrice(r.price, r.discount || 0);
              return (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>
                    {r.image ? (
                      <img
                        src={r.image}
                        alt={r.roomName}
                        style={{
                          width: 100,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 100,
                          height: 70,
                          background: "#f0f0f0",
                          borderRadius: 8,
                        }}
                      />
                    )}
                  </td>
                  <td className="text-capitalize fw-semibold">{r.roomName}</td>
                  <td>{r.width} × {r.length} ft</td>
                  <td>₹{r.price}</td>
                  <td className="text-danger fw-bold">{r.discount || 0}%</td>
                  <td className="text-success fw-bold">₹{fPrice}</td>
                  <td>
                    {r.available === false ? (
                      <span className="badge bg-danger">Out</span>
                    ) : (
                      <span className="badge bg-success">In</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => removeLayout(r.id)}
                      className="btn btn-sm btn-outline-danger me-2"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                    <NavLink
                      to={`/update-std/${r.id}`}
                      className="btn btn-sm btn-outline-warning me-2"
                      title="Edit"
                    >
                      <FaPencil />
                    </NavLink>
                    <button
                      onClick={() => openModal(r)}
                      className="btn btn-sm btn-outline-primary"
                      title="View"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
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
