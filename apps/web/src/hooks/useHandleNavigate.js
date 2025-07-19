import { useNavigate } from "react-router-dom";
import { handleOpenURI } from "../utils/utils";

export const useHandleNavigate = () => {
  const navigate = useNavigate()

  return (path) => {
    path.includes("http") ? handleOpenURI(path) : navigate(path)
  };
}