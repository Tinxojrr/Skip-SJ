import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router/routes";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
