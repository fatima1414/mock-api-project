import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { FaEye, FaTrash, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
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

  /* ---------------- Derived List (search + sort) ---------------- */
  const filteredAndSorted = useMemo(() => {
    let data = layouts;

    // 1️⃣ Search
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      data = data.filter((item) => item.roomName.toLowerCase().includes(lower));
    }

    // 2️⃣ Sort
    if (sortConfig.key) {
      data = [...data].sort((a, b) => {
        const key = sortConfig.key;

        // Special handling for finalPrice
        if (key === "finalPrice") {
          const aVal = finalPrice(a.price, a.discount || 0);
          const bVal = finalPrice(b.price, b.discount || 0);
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aVal = a[key];
        const bVal = b[key];

        // Case-insensitive, locale-aware string comparison
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal, undefined, { sensitivity: "base" })
            : bVal.localeCompare(aVal, undefined, { sensitivity: "base" });
        }

        // Numbers or other types
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [layouts, searchTerm, sortConfig]);

  /* ---------------- Handlers ---------------- */
  const requestSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <FaSort />;
    return sortConfig.direction === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

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
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-3">
        <h2 className="fw-bold text-dark mb-0">Room Layouts</h2>

        <input
          type="text"
          placeholder="Search by room name..."
          className="form-control w-auto"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <NavLink to="/add-std" className="btn btn-primary">
          Add Layout
        </NavLink>
      </div>

      <div className="table-responsive shadow-sm rounded-3">
        <table className="table table-hover align-middle text-center mb-0">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Image</th>
              <th onClick={() => requestSort("roomName")} style={{ cursor: "pointer" }}>
                Room <SortIcon column="roomName" />
              </th>
              <th>Dimensions</th>
              <th onClick={() => requestSort("price")} style={{ cursor: "pointer" }}>
                MRP <SortIcon column="price" />
              </th>
              <th onClick={() => requestSort("discount")} style={{ cursor: "pointer" }}>
                Discount <SortIcon column="discount" />
              </th>
              <th onClick={() => requestSort("finalPrice")} style={{ cursor: "pointer" }}>
                Final Price <SortIcon column="finalPrice" />
              </th>
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
