import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import { StarRatings } from "./StarRatings";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <App />
        {/* <StarRatings maxRatings={10} color="red" /> */}
    </React.StrictMode>
);
