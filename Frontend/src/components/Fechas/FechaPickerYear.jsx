import React, { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { FormatDateTimeMYSQL } from "../../utils/functions/FormatDate";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

const FechaPickerYear = ({ onNewfecEntSto, date }) => {
  const [value, setValue] = useState(null);

  const formatFechaMYSQL = (newValue) => {
    setValue(newValue);
    onNewfecEntSto(FormatDateTimeMYSQL(newValue._d));
  };

  const handleKeyDown = (event) => {
    event.preventDefault();
  }

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <DatePicker
        value={value}
        openTo={"year"}
        inputFormat="DD/MM/YYYY"
        onChange={formatFechaMYSQL}
        renderInput={(params) => <TextField {...params} onKeyDown={handleKeyDown}/>}
      />
    </LocalizationProvider>
  );
};

export default FechaPickerYear;
