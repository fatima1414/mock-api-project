import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/style.css";

import Navbar from "./Layout/Navbar";
import Home from "./pages/Home";
import AddStd from "./pages/AddStd";
import Error from "./pages/Error";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-std" element={<AddStd />} />
        <Route path="/update-std/:id" element={<AddStd />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}
