import { ListProduccionLote } from "./ListProduccionLote";
import { CrearProduccionLote } from "./CrearProduccionLote";

export const RouterProduccionLote = [
  {
    path: "",
    element: <ListProduccionLote />,
  },
  {
    path: "crear",
    element: <CrearProduccionLote />,
  },
];
