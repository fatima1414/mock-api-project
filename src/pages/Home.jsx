import axios from "axios";
import { useEffect, useState } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import { FaPencil } from "react-icons/fa6";
import { NavLink } from "react-router-dom";
import ViewLayout from "./ViewLayout";

const API = "https://68be829f9c70953d96ec8200.mockapi.io/api/romm-furniture";

export default function Home() {
  const [layouts, setLayouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchLayouts();
  }, []);

  const fetchLayouts = async () => {
    try {
      const res = await axios.get(API);
      setLayouts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const removeLayout = async (id) => {
    if (window.confirm("Delete this layout?")) {
      await axios.delete(`${API}/${id}`);
      fetchLayouts();
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

  const finalPrice = (price, discount) =>
    discount && discount > 0 ? Math.round(price - (price * discount) / 100) : price;

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark">Room Layouts</h2>
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
            {layouts.map((r, i) => {
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
                        style={{ width: 100, height: 70, background: "#f0f0f0", borderRadius: 8 }}
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

      {/* ===== Bootstrap Modal ===== */}
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
