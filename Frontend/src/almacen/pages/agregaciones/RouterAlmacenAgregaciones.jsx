import { ListAgregacion } from "./ListAgregacion";
import { AgregarAgregacion } from "./AgregarAgregacion";

export const RouterAlmacenAgregaciones = [
  {
    path: "",
    element: <ListAgregacion />,
  },
  {
    path: "crear",
    element: <AgregarAgregacion />,
  },
];
