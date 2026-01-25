import { createBrowserRouter } from "react-router";
import InputPage from "./components/InputPage";
import ResultPage from "./components/ResultPage";
import FavoritesPage from "./components/FavoritesPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: InputPage,
  },
  {
    path: "/result",
    Component: ResultPage,
  },
  {
    path: "/favorites",
    Component: FavoritesPage,
  },
]);