import { ListAgregaciones } from "./ListAgregaciones";
import { AgregarAgregacion } from "./AgregarAgregacion";

export const RouterAlmacenAgregaciones = [
  {
    path: "",
    element: <ListAgregaciones />,
  },
  {
    path: "crear",
    element: <AgregarAgregacion />,
  },
];
