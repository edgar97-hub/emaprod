import { ListLoteProduccion } from "./ListLoteProduccion";
import { ViewLoteProduccion } from "./ViewLoteProduccion";
import { AtenderAgregaciones } from "./AtenderAgregaciones";

export const RouterAlmacenLoteProduccion = [
  {
    path: "",
    element: <ListLoteProduccion />,
  },
  {
    path: "assist-agregation",
    element:<AtenderAgregaciones/>
  },
  {
    path: "view/:id",
    element: <ViewLoteProduccion />,
  },
];
