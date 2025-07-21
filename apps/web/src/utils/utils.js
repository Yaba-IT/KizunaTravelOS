import { useNavigate } from "react-router-dom";

export const handleOpenURI = (uri) => {
  window.open(uri, "_blank", "noopener noreferrer");
};

export const useHandleNavigate = () => {
  const navigate = useNavigate()

  return (path) => {
    path.includes("http") ? handleOpenURI(path) : navigate(path)
  };
}