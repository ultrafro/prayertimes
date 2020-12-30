import logo from "./logo.svg";
import "./App.css";
import PrayerTimes from "./Prayertimes.tsx";
import { BrowserRouter, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Route path="*" component={PrayerTimes}></Route>
      </BrowserRouter>
      {/* <PrayerTimes></PrayerTimes> */}
    </div>
  );
}

export default App;
