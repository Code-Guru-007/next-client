import useHasLogin from "utils/useHasLogin";
import TourComponent from "./TourComponent";

const Tour = () => {
  const hasLogin = useHasLogin();
  return !hasLogin ? <></> : <TourComponent />;
};

export default Tour;
