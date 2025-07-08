import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect after short delay (or immediately)
    const timer = setTimeout(() => {
      navigate("/login");
    }, 100); // optional delay for UX

    return () => clearTimeout(timer); // clean up
  }, [navigate]);

  return (
    <div>
      <p>Redirecting to login page...</p>
    </div>
  );
}
