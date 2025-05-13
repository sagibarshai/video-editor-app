import { ClipLoader } from "react-spinners";

interface Props{
  color?: string;
  size?: number;
}

const Loading = ({color = "#fff", size = 14}: Props) => {
  return <ClipLoader color={color} size={size} />
};

export default Loading;

