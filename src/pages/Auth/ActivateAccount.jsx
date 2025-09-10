import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../utils/api";



export default function ActivateAccount() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const res = await api.post(`/auth/activate/${token}`);
        

        if (res.ok) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error", err);
      }
    };

    activateAccount();
  }, [token]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {status === "loading" && <h2>Activando tu cuenta...</h2>}
      {status === "success" && (
        <h2 style={{ color: "green" }}>✅ Tu cuenta ha sido activada con éxito</h2>
      )}
      {status === "error" && (
        <h2 style={{ color: "red" }}>❌ El enlace no es válido o expiró</h2>
      )}
    </div>
  );
}
