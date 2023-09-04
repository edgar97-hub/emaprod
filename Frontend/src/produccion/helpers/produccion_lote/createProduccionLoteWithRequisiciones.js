import axios from 'axios';
import config from '../../../config';

export const createProduccionLoteWithRequisiciones = async (body) => {

    const domain = config.API_URL;
    const path = '/produccion/produccion-lote/create_produccion_lote_with_requisiciones.php';
    const url = domain + path;
    console.log("url: ",url)
    console.log("body: ",body)

    const { data } = await axios.post(url, {
        ...body
    });
   console.log("data: ",data)

    return data;
}