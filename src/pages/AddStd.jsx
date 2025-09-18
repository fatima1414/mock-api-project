import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://68be829f9c70953d96ec8200.mockapi.io/api/romm-furniture";

export default function AddStd() {
  const { id } = useParams();
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      axios.get(`${API}/${id}`)
        .then(res => {
          reset({
            roomName: res.data.roomName,
            width: res.data.width,
            length: res.data.length,
            image: res.data.image,
            notes: res.data.notes,
            price: res.data.price,
            discount: res.data.discount || 0,
            available: res.data.available !== false  // if available field
          });
        })
        .catch(err => console.error(err));
    }
  }, [id, reset]);

  const saveData = async (data) => {
    try {
      const payload = {
        roomName: data.roomName,
        width: Number(data.width),
        length: Number(data.length),
        image: data.image,
        notes: data.notes,
        price: Number(data.price),
        discount: Number(data.discount) || 0,
        available: data.available === "true" || data.available === true // make sure boolean
      };

      if (id) {
        await axios.put(`${API}/${id}`, payload);
        alert("Layout updated");
      } else {
        await axios.post(API, payload);
        alert("Layout added");
        reset();
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error saving data");
    }
  };

  return (
    <div className="col-lg-8 mx-auto my-5 p-5 shadow rounded bg-light">
      <h2 className="mb-4">{id ? "Edit Layout" : "Add New Layout"}</h2>
      <form onSubmit={handleSubmit(saveData)}>
        <div className="mb-3">
          <label className="form-label">Room Name</label>
          <input className="form-control" {...register("roomName", { required: true })} />
        </div>
        <div className="row">
          <div className="col mb-3">
            <label className="form-label">Width (ft)</label>
            <input className="form-control" type="number" {...register("width", { required: true })} />
          </div>
          <div className="col mb-3">
            <label className="form-label">Length (ft)</label>
            <input className="form-control" type="number" {...register("length", { required: true })} />
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Image URL</label>
          <input className="form-control" {...register("image")} />
        </div>
        <div className="mb-3">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows="3" {...register("notes")} />
        </div>
        <div className="mb-3">
          <label className="form-label">MRP (₹)</label>
          <input className="form-control" type="number" {...register("price", { required: true })} />
        </div>
        <div className="mb-3">
          <label className="form-label">Discount (%)</label>
          <input className="form-control" type="number" {...register("discount")} />
        </div>
        <div className="mb-3">
          <label className="form-label">Availability</label>
          <select className="form-control" {...register("available")}>
            <option value="true">In Stock</option>
            <option value="false">Out of Stock</option>
          </select>
        </div>
        <div className="mt-4">
          <button type="submit" className={`btn ${id ? "btn-warning" : "btn-success"} me-3`}>
            {id ? "Update Layout" : "Add Layout"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
