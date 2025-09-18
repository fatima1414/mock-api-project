export default function ViewLayout({ room }) {
  if (!room) return null;

  const hasDiscount = room.discount && room.discount > 0;
  const finalPrice = hasDiscount
    ? Math.round(room.price - (room.price * room.discount) / 100)
    : room.price;
  const isAvailable = room.available !== false;

  return (
    <div className="row">
      <div className="col-md-6 mb-3 mb-md-0">
        {room.image ? (
          <img
            src={room.image}
            alt={room.roomName}
            className="img-fluid w-100 rounded"
            style={{ maxHeight: 350, objectFit: "cover" }}
          />
        ) : (
          <div
            className="d-flex align-items-center justify-content-center bg-light rounded"
            style={{ height: 350 }}
          >
            <span className="text-muted">No Image</span>
          </div>
        )}
      </div>

      <div className="col-md-6">
        <h3 className="fw-bold">{room.roomName}</h3>
        {isAvailable ? (
          <span className="badge bg-success mb-2">In Stock</span>
        ) : (
          <span className="badge bg-danger mb-2">Out of Stock</span>
        )}

        <p><strong>Dimensions:</strong> {room.width} × {room.length} ft</p>
        {room.notes && <p className="text-secondary">{room.notes}</p>}

        <div className="my-3">
          {hasDiscount && (
            <span className="badge bg-danger me-2">-{room.discount}%</span>
          )}
          <div className="d-flex align-items-baseline">
            <span
              style={{
                fontSize: "1.4rem",
                textDecoration: hasDiscount ? "line-through" : "none",
                color: hasDiscount ? "#dc3545" : "#212529",
              }}
            >
              ₹{room.price}
            </span>
            {hasDiscount && (
              <span className="ms-3 fs-3 fw-bold text-success">₹{finalPrice}</span>
            )}
          </div>
        </div>

        <button
          className={`btn btn-lg ${isAvailable ? "btn-primary" : "btn-secondary"}`}
          disabled={!isAvailable}
        >
          {isAvailable ? "Add to Cart" : "Notify Me"}
        </button>
      </div>
    </div>
  );
}
