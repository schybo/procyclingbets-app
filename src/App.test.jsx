import React from "react";
import { render } from "@testing-library/react";
import PcbApp from "./App.jsx";

test("renders without crashing", () => {
  const { baseElement } = render(<PcbApp />);
  expect(baseElement).toBeDefined();
});
